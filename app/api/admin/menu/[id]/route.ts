import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { revalidateTag, revalidatePath } from 'next/cache'
import { z } from 'zod'

const menuItemUpdateSchema = z.object({
  name_ar: z.string().min(2, 'الاسم بالعربية مطلوب (حرفين على الأقل)'),
  name_en: z.string().min(2, 'الاسم بالإنجليزية مطلوب (حرفين على الأقل)'),
  description_ar: z.string().min(5, 'الوصف بالعربية مطلوب (5 أحرف على الأقل)'),
  description_en: z.string().min(5, 'الوصف بالإنجليزية مطلوب (5 أحرف على الأقل)'),
  category_id: z.string().min(1, 'يرجى اختيار القسم'),
  price_single: z.number().positive('سعر السنجل مطلوب وأكبر من صفر'),
  price_double: z.number().positive('سعر الدابل مطلوب وأكبر من صفر').nullable().optional(),
  price_triple: z.number().positive('سعر التريبل مطلوب وأكبر من صفر').nullable().optional(),
  image_url: z.string().url('رابط الصورة مطلوب').min(5, 'يرجى رفع صورة الصنف'),
  is_available: z.boolean(),
  sort_order: z.number().int().default(0),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { isAdmin, error, adminClient } = await verifyAdmin()
  if (!isAdmin || !adminClient) return error!

  try {
    const body = await req.json()
    const parsed = menuItemUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'بيانات غير صحيحة'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { data: updatedItem, error: updateError } = await adminClient
      .from('menu_items')
      .update({
        name_ar: parsed.data.name_ar,
        name_en: parsed.data.name_en,
        description_ar: parsed.data.description_ar,
        description_en: parsed.data.description_en,
        category_id: parsed.data.category_id,
        price_single: parsed.data.price_single,
        price_double: parsed.data.price_double ?? null,
        price_triple: parsed.data.price_triple ?? null,
        image_url: parsed.data.image_url,
        is_available: parsed.data.is_available,
        sort_order: parsed.data.sort_order,
      })
      .eq('id', params.id)
      .select('*, category:categories(id, name_ar, name_en)')
      .single()

    if (updateError) {
      console.error('[Menu Update Error]', updateError)
      return NextResponse.json({ error: `فشل تعديل الصنف: ${updateError.message}` }, { status: 500 })
    }

    try {
      revalidateTag('menu-catalog')
      revalidatePath('/')
    } catch {}

    return NextResponse.json({ item: updatedItem })
  } catch (err: any) {
    console.error('[Menu PUT Exception]', err)
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ التعديلات' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { isAdmin, error, adminClient } = await verifyAdmin()
  if (!isAdmin || !adminClient) return error!

  try {
    const { error: deleteError } = await adminClient
      .from('menu_items')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('[Menu DELETE Error]', deleteError)
      return NextResponse.json({ error: `فشل حذف الصنف: ${deleteError.message}` }, { status: 500 })
    }

    try {
      revalidateTag('menu-catalog')
      revalidatePath('/')
    } catch {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Menu DELETE Exception]', err)
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الصنف' }, { status: 500 })
  }
}
