import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function verifyAdmin() {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      isAdmin: false,
      error: NextResponse.json({ error: 'غير مصرح به — يرجى تسجيل الدخول' }, { status: 401 }),
      user: null,
      adminClient: null,
    }
  }

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return {
      isAdmin: false,
      error: NextResponse.json({ error: 'غير مصرح به — صلاحيات أدمن مطلوبة' }, { status: 403 }),
      user,
      adminClient: null,
    }
  }

  return { isAdmin: true, error: null, user, adminClient }
}
