import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { sendOrderEditNotification, sendOrderDeletionNotification } from '@/lib/discord'
import type { OrderStatus } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  on_delivery: 'جاري التوصيل',
  finished: 'مكتمل',
  cancelled: 'ملغي',
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { isAdmin, error, adminClient } = await verifyAdmin()
  if (!isAdmin || !adminClient) return error!

  try {
    const body = await req.json()
    const { status, customer_name, customer_phone, delivery_address, notes } = body

    // 1. Fetch current order
    const { data: currentOrder, error: fetchErr } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchErr || !currentOrder) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // 2. Track changes for diff & Discord notification
    const changes: { field: string; oldVal: string; newVal: string }[] = []

    if (status && status !== currentOrder.status) {
      const allowed: OrderStatus[] = ['pending', 'confirmed', 'on_delivery', 'finished', 'cancelled']
      if (allowed.includes(status)) {
        changes.push({
          field: 'حالة الطلب',
          oldVal: STATUS_LABELS[currentOrder.status] || currentOrder.status,
          newVal: STATUS_LABELS[status] || status,
        })
      }
    }

    if (customer_name && customer_name !== currentOrder.customer_name) {
      changes.push({
        field: 'اسم العميل',
        oldVal: currentOrder.customer_name,
        newVal: customer_name,
      })
    }

    if (customer_phone && customer_phone !== currentOrder.customer_phone) {
      changes.push({
        field: 'رقم الهاتف',
        oldVal: currentOrder.customer_phone,
        newVal: customer_phone,
      })
    }

    if (delivery_address && delivery_address !== currentOrder.delivery_address) {
      changes.push({
        field: 'عنوان التوصيل',
        oldVal: currentOrder.delivery_address,
        newVal: delivery_address,
      })
    }

    if (notes !== undefined && notes !== (currentOrder.notes || '')) {
      changes.push({
        field: 'ملاحظات الطلب',
        oldVal: currentOrder.notes || '(بدون ملاحظات)',
        newVal: notes || '(تم الحذف)',
      })
    }

    // If nothing changed, return early
    if (changes.length === 0) {
      return NextResponse.json({ success: true, order: currentOrder, message: 'لم يتم تغيير أي بيانات' })
    }

    // 3. Update in database
    const updatePayload: any = {}
    if (status) updatePayload.status = status
    if (customer_name) updatePayload.customer_name = customer_name
    if (customer_phone) updatePayload.customer_phone = customer_phone
    if (delivery_address) updatePayload.delivery_address = delivery_address
    if (notes !== undefined) updatePayload.notes = notes

    const { data: updatedOrder, error: updateErr } = await adminClient
      .from('orders')
      .update(updatePayload)
      .eq('id', params.id)
      .select('*')
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // 4. Send Discord Edit Notification (awaited for reliability in serverless)
    await sendOrderEditNotification(updatedOrder, changes)

    return NextResponse.json({ success: true, order: updatedOrder, changes })
  } catch (err: any) {
    console.error('[Order PATCH Exception]', err)
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل الطلب' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { isAdmin, error, adminClient } = await verifyAdmin()
  if (!isAdmin || !adminClient) return error!

  try {
    // 1. Fetch order first to record details and previous status
    const { data: orderToDelete, error: fetchErr } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchErr || !orderToDelete) {
      return NextResponse.json({ error: 'الطلب غير موجود أو تم حذفه مسبقاً' }, { status: 404 })
    }

    const previousStatus = STATUS_LABELS[orderToDelete.status] || orderToDelete.status

    // 2. Delete from database
    const { error: deleteErr } = await adminClient
      .from('orders')
      .delete()
      .eq('id', params.id)

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 })
    }

    // 3. Send Discord Deletion Notification with previous status
    await sendOrderDeletionNotification(orderToDelete, previousStatus)

    return NextResponse.json({
      success: true,
      message: 'تم حذف الطلب بنجاح',
      deletedOrder: orderToDelete,
      previousStatus,
    })
  } catch (err: any) {
    console.error('[Order DELETE Exception]', err)
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الطلب' }, { status: 500 })
  }
}
