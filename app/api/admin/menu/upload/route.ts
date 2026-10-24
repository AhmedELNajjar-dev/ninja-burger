import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const { isAdmin, error, adminClient } = await verifyAdmin()
  if (!isAdmin || !adminClient) return error!

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرفاق ملف صورة' }, { status: 400 })
    }

    // Validate MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع الصورة غير مدعوم. الأنواع المدعومة: JPEG, PNG, WebP' },
        { status: 400 }
      )
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp'
    const fileName = `${Date.now()}-${uuidv4()}.${ext}`

    // Ensure bucket exists
    const { data: buckets } = await adminClient.storage.listBuckets()
    const bucketExists = buckets?.some((b: any) => b.id === 'menu-items')
    if (!bucketExists) {
      await adminClient.storage.createBucket('menu-items', { public: true })
    }

    const { error: uploadError } = await adminClient.storage
      .from('menu-items')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[Storage] Upload error:', uploadError)
      return NextResponse.json(
        { error: `فشل رفع الصورة: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const { data: publicUrlData } = adminClient.storage
      .from('menu-items')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch (err: any) {
    console.error('[Upload] Exception:', err)
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة رفع الصورة' }, { status: 500 })
  }
}
