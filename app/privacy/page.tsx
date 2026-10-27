import type { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { PrivacyPageClient } from '@/components/legal/PrivacyPageClient'
import type { Profile } from '@/types'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية وأمان البيانات | Privacy Policy — نينجا برجر',
  description:
    'سياسة الخصوصية وحماية بيانات العملاء في نينجا برجر: كيفية حفظ بياناتك في سوبابيز، الاستخدام الوظيفي لملفات تعريف الارتباط، وضمان عدم بيع أي بيانات.',
}

export default async function PrivacyPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    profile = data ?? null
  }

  return (
    <div className="min-h-screen bg-ninja-gray flex flex-col justify-between">
      <Navbar profile={profile} />
      <PrivacyPageClient />
      <Footer />
    </div>
  )
}
