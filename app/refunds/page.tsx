import type { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { RefundsPageClient } from '@/components/legal/RefundsPageClient'
import type { Profile } from '@/types'

export const metadata: Metadata = {
  title: 'سياسة الإلغاء والاسترجاع والتعويض | Refund & Cancellation — نينجا برجر',
  description:
    'سياسة الإلغاء والاسترجاع في نينجا برجر: قواعد إلغاء طلبات الطعام قبل طهيها، ضمان الجودة، والتعويض الفوري عن أي صنف متضرر أو غير مطابق.',
}

export default async function RefundsPage() {
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
      <RefundsPageClient />
      <Footer />
    </div>
  )
}
