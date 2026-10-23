import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'
import type { Order, Profile } from '@/types'

export const metadata = { title: 'لوحة التحكم — نينجا برجر' }

export default async function AdminPage() {
  const supabase = createClient()
  const adminClient = createAdminClient()

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/admin')

  // Verify admin role using adminClient (bypasses RLS on server)
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  // Fetch initial orders (last 50, sorted newest first)
  const { data: orders } = await adminClient
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Count order frequency per phone number to identify first-time customers
  const phoneCounts: Record<string, number> = {}
  orders?.forEach((o: any) => {
    phoneCounts[o.customer_phone] = (phoneCounts[o.customer_phone] || 0) + 1
  })

  const enrichedOrders = (orders ?? []).map((o: any) => ({
    ...o,
    is_first_order: (phoneCounts[o.customer_phone] ?? 1) === 1,
  }))

  return (
    <AdminDashboardClient
      initialOrders={enrichedOrders as Order[]}
      adminProfile={profile as Profile}
    />
  )
}
