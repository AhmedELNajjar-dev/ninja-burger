import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import OrdersClient from './OrdersClient'
import type { Order, Profile } from '@/types'

export const metadata = { title: 'طلباتي — نينجا برجر' }

export default async function OrdersPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/orders')

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return (
    <div className="min-h-screen bg-ninja-gray">
      <Navbar profile={profile as Profile | null} />
      <OrdersClient
        initialOrders={(orders ?? []) as Order[]}
        userId={user.id}
      />
    </div>
  )
}
