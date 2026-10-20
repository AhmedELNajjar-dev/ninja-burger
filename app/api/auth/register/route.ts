import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validators'
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
    // Rate limit: max 5 account registrations per hour (3600s) per IP
    const rl = await rateLimit({
      limit: 5,
      windowSeconds: 3600,
      identifier: `register:${clientIp}`,
    })

    if (!rl.success) {
      return rateLimitExceededResponse('تم تجاوز الحد المسموح لإنشاء الحسابات من هذا الجهاز. يرجى المحاولة بعد ساعة.')
    }

    const body = await request.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { full_name, phone: rawPhone, email, password } = result.data
    const phone = normalizePhone(rawPhone)
    const adminClient = createAdminClient()

    // Check phone uniqueness first
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'رقم الهاتف مستخدم بالفعل' },
        { status: 409 }
      )
    }

    // Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation for frictionless UX
      user_metadata: { full_name, phone },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Upsert profile row (handles case where handle_new_user trigger already inserted a row)
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name,
        phone,
        role: 'customer',
      })

    if (profileError) {
      console.error('[Register] profileError:', profileError)
      // Rollback: delete the created auth user
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: profileError.message || 'حدث خطأ في إنشاء الحساب' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data: { message: 'تم إنشاء الحساب بنجاح' } },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
