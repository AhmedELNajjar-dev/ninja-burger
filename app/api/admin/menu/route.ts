import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { z } from 'zod'

const menuItemSchema = z.object({
  name_ar: z.string().min(2, 'الاسم بالعربية مطلوب (حرفين على الأقل)'),
  name_en: z.string().min(2, 'الاسم بالإنجليزية مطلوب (حرفين على الأقل)'),
  description_ar: z.string().min(5, 'الوصف بالعربية مطلوب (5 أحرف على الأقل)'),
  description_en: z.string().min(5, 'الوصف بالإنجليزية مطلوب (5 أحرف على الأقل)'),
  category_id: z.string().uuid('يرجى اختيار القسم'),
  price_single: z.number().positive('سعر السنجل مطلوب وأكبر من صفر'),
  price_double: z.number().positive('سعر الدابل مطلوب وأكبر من صفر'),
  price_triple: z.number().positive('سعر التريبل مطلوب وأكبر من صفر'),
  image_url: z.string().url('رابط الصورة مطلوب').min(5, 'يرجى رفع صورة الصنف'),
  is_available: z.boolean(),
  sort_order: z.number().int().default(0),
})

export async function GET() {
  const { isAdmin, error, adminClient } = await verifyAdmin()
  if (!isAdmin || !adminClient) return error!

  const [{ data: items, error: itemsError }, { data: categories }, { data: addons }] =
    await Promise.all([
      adminClient
        .from('menu_items')
        .select('*, category:categories(id, name_ar, name_en)')
        .order('sort_order', { ascending: true }),
      adminClient.from('categories').select('*').order('sort_order', { ascending: true }),
      adminClient.from('addons').select('*').order('sort_order', { ascending: true }),
    ])

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  return NextResponse.json({ items, categories, addons })
}

export async function POST(req: NextRequest) {
  const { isAdmin, error, adminClient } = await verifyAdmin()
  if (!isAdmin || !adminClient) return error!

  try {
    const body = await req.json()
    const parsed = menuItemSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'بيانات غير صحيحة'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { data: newItem, error: insertError } = await adminClient
      .from('menu_items')
      .insert({
        name_ar: parsed.data.name_ar,
        name_en: parsed.data.name_en,
        description_ar: parsed.data.description_ar,
        description_en: parsed.data.description_en,
        category_id: parsed.data.category_id,
        price_single: parsed.data.price_single,
        price_double: parsed.data.price_double,
        price_triple: parsed.data.price_triple,
        image_url: parsed.data.image_url,
        is_available: parsed.data.is_available,
        sort_order: parsed.data.sort_order,
      })
      .select('*, category:categories(id, name_ar, name_en)')
      .single()

    if (insertError) {
      console.error('[Menu Insert Error]', insertError)
      return NextResponse.json({ error: `فشل إضافة الصنف: ${insertError.message}` }, { status: 500 })
    }

    return NextResponse.json({ item: newItem }, { status: 201 })
  } catch (err: any) {
    console.error('[Menu POST Exception]', err)
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الطلب' }, { status: 500 })
  }
}
