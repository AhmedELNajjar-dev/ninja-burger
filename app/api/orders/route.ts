import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendOrderNotification } from '@/lib/discord'
import { checkoutSchema } from '@/lib/validators'
import { rateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/rateLimit'

const DELIVERY_FEE = 35 // Fixed delivery fee in EGP

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    // Rate limit: max 10 orders per 30 minutes (1800s) per IP
    const rlIp = await rateLimit({
      limit: 10,
      windowSeconds: 1800,
      identifier: `order_create:${clientIp}`,
    })

    if (!rlIp.success) {
      return rateLimitExceededResponse('لقد قمت بإرسال عدد كبير من الطلبات في وقت قصير. يرجى الانتظار قليلاً.')
    }

    const body = await request.json()
    const result = checkoutSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'بيانات الطلب غير صحيحة' },
        { status: 400 }
      )
    }

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
      items: rawItems,
    } = result.data

    // Per-phone rate limit: max 5 orders per 30 minutes to prevent SMS/order flooding
    const rlPhone = await rateLimit({
      limit: 5,
      windowSeconds: 1800,
      identifier: `order_phone:${customer_phone}`,
    })

    if (!rlPhone.success) {
      return rateLimitExceededResponse('تم تقديم عدة طلبات من هذا الرقم مؤخراً. يرجى الانتظار بضع دقائق.')
    }

    const supabase = createClient()
    const adminClient = createAdminClient()

    // Get current user (optional — guest checkout allowed)
    const { data: { user } } = await supabase.auth.getUser()

    // ── Server-Side Price Calculation & Verification ──
    const menuIds = Array.from(new Set(rawItems.map(i => i.menuItemId)))
    const addonIds = Array.from(new Set(rawItems.flatMap(i => (i.addons || []).map(a => a.id))))

    const [{ data: menuRows, error: menuErr }, { data: addonRows, error: addonErr }] = await Promise.all([
      adminClient
        .from('menu_items')
        .select('id, name_ar, name_en, price_single, price_double, price_triple, is_available')
        .in('id', menuIds),
      addonIds.length
        ? adminClient.from('addons').select('id, name_ar, price').in('id', addonIds)
        : Promise.resolve({ data: [] as any[], error: null }),
    ])

    if (menuErr || !menuRows) {
      return NextResponse.json({ error: 'تعذر التحقق من قائمة الأصناف' }, { status: 500 })
    }

    const menuMap = new Map((menuRows as any[]).map((m: any) => [m.id, m]))
    const addonMap = new Map(((addonRows as any[]) ?? []).map((a: any) => [a.id, a]))

    let subtotal = 0
    const verifiedItems = []

    for (const it of rawItems) {
      const m = menuMap.get(it.menuItemId)
      if (!m || !m.is_available) {
        return NextResponse.json({ error: `الصنف ${m?.name_ar || ''} غير متاح حالياً` }, { status: 400 })
      }

      const unitPrice = Number(
        it.size === 'single'
          ? m.price_single
          : it.size === 'double'
          ? m.price_double
          : m.price_triple
      )

      if (!unitPrice || isNaN(unitPrice)) {
        return NextResponse.json({ error: `الحجم المحدد (${it.size}) غير متوفر لهذا الصنف` }, { status: 400 })
      }

      const verifiedAddons = []
      let addonsSum = 0

      for (const a of it.addons || []) {
        const addonRow = addonMap.get(a.id)
        if (!addonRow) {
          return NextResponse.json({ error: 'إضافة غير صحيحة أو غير متاحة' }, { status: 400 })
        }
        const addonPrice = Number(addonRow.price) || 0
        verifiedAddons.push({
          id: addonRow.id,
          name_ar: addonRow.name_ar,
          price: addonPrice,
        })
        addonsSum += addonPrice
      }

      const lineTotal = (unitPrice + addonsSum) * it.quantity
      subtotal += lineTotal

      verifiedItems.push({
        menuItemId: m.id,
        name_ar: m.name_ar,
        name_en: m.name_en,
        size: it.size,
        quantity: it.quantity,
        unitPrice,
        addons: verifiedAddons,
        lineTotal,
      })
    }

    // Server-computed total amount including fixed delivery fee
    const total_amount = Math.round((subtotal + DELIVERY_FEE) * 100) / 100

    // ── Check if this customer already has past orders ──
    const { count: pastOrdersCount } = await adminClient
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('customer_phone', customer_phone)

    const isFirstTimeCustomer = (pastOrdersCount ?? 0) === 0

    // Assemble full readable address with building, floor and apartment
    const addressDetailsParts = [
      delivery_address,
      building_no ? `عمارة: ${building_no}` : null,
      floor_no ? `الدور: ${floor_no}` : null,
      apartment_no ? `شقة: ${apartment_no}` : null,
    ].filter(Boolean)

    const fullAddress = addressDetailsParts.join(' | ')

    // ── Prevent Discord Link Injection: Validate map_url strictly ──
    const safeMapUrl = map_coordinates
      ? `https://maps.google.com/?q=${map_coordinates.lat},${map_coordinates.lng}`
      : map_url && /^https:\/\/(www\.)?(google\.com\/maps|maps\.google\.com)/.test(map_url)
      ? map_url
      : null

    // Insert order using admin client (bypasses RLS for INSERT)
    const { data: order, error } = await adminClient
      .from('orders')
      .insert({
        user_id: user?.id ?? null,
        customer_name,
        customer_phone,
        delivery_address: fullAddress,
        notes: notes ?? null,
        items: verifiedItems,
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

    // ── Save address into user's profile for 1-click auto-fill on next orders ──
    if (user) {
      adminClient
        .from('profiles')
        .update({
          saved_address: {
            delivery_address,
            building_no: building_no || '',
            floor_no: floor_no || '',
            apartment_no: apartment_no || '',
            map_url: safeMapUrl || '',
            notes: notes || '',
          },
        })
        .eq('id', user.id)
        .then(() => {})
        .catch((e: unknown) => console.warn('[Orders] Could not save address to profile:', e))
    }

    // Attach transient map_url & is_first_order attributes for alerts
    const orderWithMetadata = {
      ...order,
      map_url: safeMapUrl,
      is_first_order: isFirstTimeCustomer,
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
  } catch (err) {
    console.error('[Orders POST] unexpected error:', err)
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

    // Count how many orders each phone number has in the entire database
    const phoneCounts: Record<string, number> = {}
    orders?.forEach((o: any) => {
      phoneCounts[o.customer_phone] = (phoneCounts[o.customer_phone] || 0) + 1
    })

    // If a phone number only appears once, this is their very first order!
    const enrichedOrders = orders?.map((o: any) => ({
      ...o,
      is_first_order: (phoneCounts[o.customer_phone] ?? 1) === 1,
    }))

    return NextResponse.json({ data: enrichedOrders })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
