import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validators'
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
    // Rate limit: max 10 login attempts per 15 minutes (900s) per IP
    const rl = await rateLimit({
      limit: 10,
      windowSeconds: 900,
      identifier: `login:${clientIp}`,
    })

    if (!rl.success) {
      return rateLimitExceededResponse('تم تجاوز الحد المسموح لمحاولات تسجيل الدخول. يرجى الانتظار 15 دقيقة والمحاولة مرة أخرى.')
    }

    const body = await request.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { identifier, password } = result.data
    const supabase = createClient()
    const adminClient = createAdminClient()

    let email = identifier.trim()

    // Normalize phone number (handling Arabic digits, spaces, +20, etc.)
    const cleanedPhone = normalizePhone(email)
    const egyptianPhoneRegex = /^0(10|11|12|15)[0-9]{8}$/
    const isPhone = egyptianPhoneRegex.test(cleanedPhone)

    if (isPhone) {
      // Must use adminClient to bypass RLS since the user is not authenticated yet
      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('id, phone')
        .or(`phone.eq.${cleanedPhone},phone.eq.+2${cleanedPhone},phone.eq.2${cleanedPhone},phone.eq.002${cleanedPhone}`)
        .limit(1)
        .maybeSingle()

      if (profileError || !profile) {
        return NextResponse.json(
          { error: 'لا يوجد حساب مرتبط بهذا الرقم' },
          { status: 401 }
        )
      }

      // Look up auth user to get their registered email
      const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(profile.id)

      if (authError || !authUser.user?.email) {
        return NextResponse.json(
          { error: 'حدث خطأ أثناء المصادقة' },
          { status: 500 }
        )
      }

      email = authUser.user.email
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني / رقم الهاتف أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    return NextResponse.json({ data: { user: data.user } })
  } catch (e) {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
