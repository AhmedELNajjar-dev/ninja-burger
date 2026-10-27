import type { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { TermsPageClient } from '@/components/legal/TermsPageClient'
import type { Profile } from '@/types'

export const metadata: Metadata = {
  title: 'شروط الاستخدام والخدمة | Terms of Service — نينجا برجر',
  description:
    'شروط الاستخدام والخدمة لمنصة نينجا برجر: قواعد تقديم الطلبات، شفافية الأسعار، مواعيد التوصيل، والتزامات العميل والمطعم.',
}

export default async function TermsPage() {
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
      <TermsPageClient />
      <Footer />
    </div>
  )
}
