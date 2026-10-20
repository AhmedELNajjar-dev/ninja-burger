import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/rateLimit'

const RESTAURANT_WHATSAPP = '201008427736'

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
    // Rate limit: max 3 WhatsApp OTP generation requests per 10 minutes (600s) per IP
    const rl = await rateLimit({
      limit: 3,
      windowSeconds: 600,
      identifier: `otp_send:${clientIp}`,
    })

    if (!rl.success) {
      return rateLimitExceededResponse('تم طلب كود التأكيد عدة مرات. يرجى الانتظار 10 دقائق قبل إعادة المحاولة.')
    }

    const supabase = createClient()
    const adminClient = createAdminClient()

    let phone: string | null = null
    let userId: string | null = null

    // Try reading user from session
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userId = user.id
      const { data: profile } = await adminClient
        .from('profiles')
        .select('phone, is_phone_verified')
        .eq('id', user.id)
        .single()

      if (profile) {
        phone = profile.phone
      }
    }

    // Alternatively, phone passed in body (e.g. immediately after registration or before login)
    const body = await request.json().catch(() => ({}))
    if (!phone && body?.phone) {
      phone = normalizePhone(body.phone)
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id, phone')
        .or(`phone.eq.${phone},phone.eq.+2${phone},phone.eq.2${phone}`)
        .limit(1)
        .maybeSingle()

      if (profile) {
        userId = profile.id
        phone = profile.phone
      }
    }

    if (!phone || !userId) {
      return NextResponse.json(
        { error: 'رقم الهاتف أو المستخدم غير موجود' },
        { status: 400 }
      )
    }

    // Generate random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString()

    // Store in public.profiles using adminClient
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ phone_verification_code: code })
      .eq('id', userId)

    if (updateError) {
      console.error('[Verify Send] DB Error:', updateError)
      return NextResponse.json(
        { error: 'فشل حفظ رمز التأكيد' },
        { status: 500 }
      )
    }

    // Build standard WhatsApp deep-link
    // Text: مرحباً نينجا برجر، كود تأكيد رقم هاتفي (010XXXXXXXX) هو: 1234
    const message = `مرحباً نينجا برجر 🥷، كود تأكيد رقم هاتفي (${phone}) هو: ${code}`
    const whatsappUrl = `https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodeURIComponent(message)}`

    return NextResponse.json({
      success: true,
      code,
      phone,
      whatsappUrl,
    })
  } catch (error) {
    console.error('[Verify Send] Server Error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
