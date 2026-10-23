import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendOrderNotification } from '@/lib/discord'
import { checkoutSchema } from '@/lib/validators'
import { rateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    // Rate limit: max 10 orders per 30 minutes (1800s) per IP
    const rl = await rateLimit({
      limit: 10,
      windowSeconds: 1800,
      identifier: `order_create:${clientIp}`,
    })

    if (!rl.success) {
      return rateLimitExceededResponse('لقد قمت بإرسال عدد كبير من الطلبات في وقت قصير. يرجى الانتظار قليلاً.')
    }

    const body = await request.json()
    const result = checkoutSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const adminClient = createAdminClient()

    // Get current user (optional — guest checkout allowed)
    const { data: { user } } = await supabase.auth.getUser()

    const {
      customer_name,
      customer_phone,
      delivery_address,
      building_no,
      floor_no,
      apartment_no,
      map_coordinates,
      map_url,
      notes,
      items,
      total_amount,
    } = result.data

    // Check if this phone number is a first-time customer
    const { count: previousOrdersCount } = await adminClient
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('customer_phone', customer_phone)

    const isFirstOrder = (previousOrdersCount ?? 0) === 0

    // Assemble full readable address with building, floor and apartment
    const addressDetailsParts = [
      delivery_address,
      building_no ? `عمارة: ${building_no}` : null,
      floor_no ? `الدور: ${floor_no}` : null,
      apartment_no ? `شقة: ${apartment_no}` : null,
    ].filter(Boolean)

    const fullAddress = addressDetailsParts.join(' | ')

    // Insert order using admin client (bypasses RLS for INSERT)
    const { data: order, error } = await adminClient
      .from('orders')
      .insert({
        user_id: user?.id ?? null,
        customer_name,
        customer_phone,
        delivery_address: fullAddress,
        notes: notes ?? null,
        items,
        total_amount,
        status: 'pending',
      })
      .select()
      .single()

    if (error || !order) {
      console.error('[Orders] Insert error:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تسجيل الطلب' },
        { status: 500 }
      )
    }

    // Attach transient map_url & is_first_order attributes for alerts
    const orderWithMetadata = {
      ...order,
      map_url: map_url || (map_coordinates ? `https://maps.google.com/?q=${map_coordinates.lat},${map_coordinates.lng}` : null),
      is_first_order: isFirstOrder,
    }

    // Send Discord notification asynchronously with map link & first-timer alert
    sendOrderNotification(orderWithMetadata as any).then((success) => {
      if (success) {
        adminClient
          .from('orders')
          .update({ discord_notified: true })
          .eq('id', order.id)
          .then(() => {})
      }
    })

    return NextResponse.json({ data: orderWithMetadata }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const query = adminClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (profile?.role !== 'admin') {
      query.eq('user_id', user.id)
    }

    const { data: orders, error } = await query.limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // For each order, compute if it's the customer's first order
    const phoneCounts: Record<string, number> = {}
    orders?.forEach((o: any) => {
      phoneCounts[o.customer_phone] = (phoneCounts[o.customer_phone] || 0) + 1
    })

    const enrichedOrders = orders?.map((o: any) => ({
      ...o,
      is_first_order: phoneCounts[o.customer_phone] <= 1,
    }))

    return NextResponse.json({ data: enrichedOrders })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
