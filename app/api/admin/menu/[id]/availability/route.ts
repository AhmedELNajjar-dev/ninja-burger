import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { isAdmin, error, adminClient } = await verifyAdmin()
  if (!isAdmin || !adminClient) return error!

  try {
    const { is_available } = await req.json()

    if (typeof is_available !== 'boolean') {
      return NextResponse.json({ error: 'قيمة حالة التوفر غير صحيحة' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await adminClient
      .from('menu_items')
      .update({ is_available })
      .eq('id', params.id)
      .select('id, is_available, name_ar, name_en')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, item: updated })
  } catch (err: any) {
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل حالة التوفر' }, { status: 500 })
  }
}
