import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { updateStatusSchema } from '@/lib/validators'
import { sendOrderCancellationNotification } from '@/lib/discord'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const result = updateStatusSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'حالة الطلب غير صحيحة' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const adminClient = createAdminClient()

    // Verify requester is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const { data: order, error } = await adminClient
      .from('orders')
      .update({ status: result.data.status })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'الطلب غير موجود أو حدث خطأ في التحديث' },
        { status: 404 }
      )
    }

    // If admin cancelled the order, alert the kitchen on Discord (awaited for serverless)
    if (result.data.status === 'cancelled') {
      try {
        await sendOrderCancellationNotification(order, 'admin')
      } catch (err) {
        console.error('[Discord Alert Error]:', err)
      }
    }

    return NextResponse.json({ data: order })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
