import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { revalidateTag, revalidatePath } from 'next/cache'
import { z } from 'zod'

const updateAddonSchema = z.object({
  price: z.number().positive('السعر مطلوب وأكبر من صفر').optional(),
  is_available: z.boolean().optional(),
  name_ar: z.string().min(2, 'الاسم بالعربية مطلوب').optional(),
  name_en: z.string().min(2, 'الاسم بالإنجليزية مطلوب').optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { isAdmin, error, adminClient } = await verifyAdmin()
  if (!isAdmin || !adminClient) return error!

  try {
    const body = await req.json()
    const parsed = updateAddonSchema.safeParse(body)

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'بيانات غير صحيحة'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const updatePayload: any = {}
    if (parsed.data.price !== undefined) updatePayload.price = parsed.data.price
    if (parsed.data.is_available !== undefined) updatePayload.is_available = parsed.data.is_available
    if (parsed.data.name_ar !== undefined) updatePayload.name_ar = parsed.data.name_ar
    if (parsed.data.name_en !== undefined) updatePayload.name_en = parsed.data.name_en

    const { data: updatedAddon, error: updateError } = await adminClient
      .from('addons')
      .update(updatePayload)
      .eq('id', params.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('[Addon PATCH Error]', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    try {
      revalidateTag('menu-catalog')
      revalidatePath('/')
    } catch {}

    return NextResponse.json({ success: true, addon: updatedAddon })
  } catch (err: any) {
    console.error('[Addon PATCH Exception]', err)
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل الإضافة' }, { status: 500 })
  }
}
