import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendOrderCancellationNotification } from '@/lib/discord'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const adminClient = createAdminClient()

    // 1. Verify authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 })
    }

    // 2. Fetch the target order
    const { data: order, error: fetchError } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // 3. Verify ownership: user can only cancel their own order
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'غير مصرح لك بإلغاء هذا الطلب' }, { status: 403 })
    }

    // 4. Cancellation rule: Only allowed while status is 'pending'
    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'هذا الطلب ملغي بالفعل' }, { status: 400 })
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'عذراً، لا يمكن إلغاء الطلب بعد تأكيده وبدء تحضيره في المطبخ' },
        { status: 400 }
      )
    }

    // 5. Update order status to 'cancelled'
    const { data: updatedOrder, error: updateError } = await adminClient
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError || !updatedOrder) {
      return NextResponse.json({ error: 'فشل في إلغاء الطلب، يرجى المحاولة مرة أخرى' }, { status: 500 })
    }

    // 6. Notify Kitchen on Discord asynchronously
    sendOrderCancellationNotification(updatedOrder, 'customer').catch((err) => {
      console.error('[Discord Alert Error]:', err)
    })

    return NextResponse.json({
      data: updatedOrder,
      message: 'تم إلغاء الطلب بنجاح',
    })
  } catch (err) {
    console.error('[Cancel Order Error]:', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
