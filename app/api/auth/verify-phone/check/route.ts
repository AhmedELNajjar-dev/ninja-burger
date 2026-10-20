import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/rateLimit'

function normalizePhone(input: string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  let res = input
  arabicDigits.forEach((d, i) => {
    res = res.replaceAll(d, i.toString())
  })
  let clean = res.replace(/[\s\-\(\)\+]/g, '')
  if (clean.startsWith('0020')) clean = '0' + clean.slice(4)
  else if (clean.startsWith('20') && clean.length === 12) clean = '0' + clean.slice(2)
  return clean
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    // Rate limit: max 5 OTP check attempts per 10 minutes to prevent brute-forcing
    const rl = await rateLimit({
      limit: 5,
      windowSeconds: 600,
      identifier: `otp_check:${clientIp}`,
    })

    if (!rl.success) {
      return rateLimitExceededResponse('تم استنفاد محاولات إدخال الرمز الخاطئ. يرجى الانتظار 10 دقائق.')
    }

    const body = await request.json()
    const { code, phone: rawPhone } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'يرجى إدخال رمز التأكيد' },
        { status: 400 }
      )
    }

    const cleanCode = code.trim()
    const supabase = createClient()
    const adminClient = createAdminClient()

    let userId: string | null = null

    // Check logged in user
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userId = user.id
    } else if (rawPhone) {
      const phone = normalizePhone(rawPhone)
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id')
        .or(`phone.eq.${phone},phone.eq.+2${phone},phone.eq.2${phone}`)
        .limit(1)
        .maybeSingle()

      if (profile) {
        userId = profile.id
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'لم يتم العثور على الحساب' },
        { status: 404 }
      )
    }

    // Get current verification code
    const { data: profile, error: fetchError } = await adminClient
      .from('profiles')
      .select('id, phone_verification_code, is_phone_verified')
      .eq('id', userId)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: 'تعذر التحقق من بيانات الحساب' },
        { status: 500 }
      )
    }

    if (profile.is_phone_verified) {
      return NextResponse.json({
        success: true,
        message: 'تم توثيق الرقم بالفعل مسبقاً',
        is_phone_verified: true,
      })
    }

    if (!profile.phone_verification_code || profile.phone_verification_code !== cleanCode) {
      return NextResponse.json(
        { error: 'رمز التأكيد غير صحيح. تأكد من إدخال الرمز المكون من 4 أرقام' },
        { status: 400 }
      )
    }

    // Mark as verified & clear verification code
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        is_phone_verified: true,
        phone_verification_code: null,
      })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json(
        { error: 'فشل حفظ حالة التوثيق' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'تم تأكيد رقم الهاتف بنجاح! 🎉',
      is_phone_verified: true,
    })
  } catch (error) {
    console.error('[Verify Check] Server Error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
