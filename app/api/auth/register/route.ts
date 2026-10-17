import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { full_name, phone, email, password } = result.data
    const adminClient = createAdminClient()

    // Check phone uniqueness first
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single()

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

    // Insert profile row
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name,
        phone,
        role: 'customer',
      })

    if (profileError) {
      // Rollback: delete the created auth user
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'حدث خطأ في إنشاء الحساب' },
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
