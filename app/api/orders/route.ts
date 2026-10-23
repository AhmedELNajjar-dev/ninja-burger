import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendOrderNotification } from '@/lib/discord'
import { sendKitchenOrderAlert } from '@/lib/whatsappGateway'
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

    const { customer_name, customer_phone, delivery_address, notes, items, total_amount } = result.data

    // Insert order using admin client (bypasses RLS for INSERT)
    const { data: order, error } = await adminClient
      .from('orders')
      .insert({
        user_id: user?.id ?? null,
        customer_name,
        customer_phone,
        delivery_address,
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

    // Send Discord notification asynchronously (don't block the response)
    sendOrderNotification(order as any).then((success) => {
      if (success) {
        adminClient
          .from('orders')
          .update({ discord_notified: true })
          .eq('id', order.id)
          .then(() => {})
      }
    })

    // Send instant automated WhatsApp alert to the kitchen/manager
    sendKitchenOrderAlert(order).catch((err) => {
      console.warn('[Orders] WhatsApp kitchen alert skipped:', err)
    })

    return NextResponse.json({ data: order }, { status: 201 })
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

    return NextResponse.json({ data: orders })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
