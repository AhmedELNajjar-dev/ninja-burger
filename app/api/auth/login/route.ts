import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
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

    let email = identifier.trim()

    // Check if identifier looks like a phone number
    const phoneRegex = /^(\+?2)?0(10|11|12|15)[0-9]{8}$/
    const isPhone = phoneRegex.test(email.replace(/\s/g, ''))

    if (isPhone) {
      // Look up the email associated with this phone
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', email.replace(/\s/g, ''))
        .single()

      if (profileError || !profile) {
        return NextResponse.json(
          { error: 'لا يوجد حساب مرتبط بهذا الرقم' },
          { status: 401 }
        )
      }

      // Get email from auth.users via service-role (profiles doesn't store email)
      const { createAdminClient } = await import('@/lib/supabase/server')
      const adminClient = createAdminClient()
      const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(profile.id)

      if (authError || !authUser.user?.email) {
        return NextResponse.json(
          { error: 'حدث خطأ في المصادقة' },
          { status: 500 }
        )
      }

      email = authUser.user.email
    }

    // Sign in with email + password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    return NextResponse.json({ data: { user: data.user } })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
