import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'
import type { Order, Profile } from '@/types'

export const metadata = { title: 'لوحة التحكم — نينجا برجر' }

export default async function AdminPage() {
  const supabase = createClient()

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/admin')

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  // Fetch initial orders (last 50, sorted newest first)
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <AdminDashboardClient
      initialOrders={(orders ?? []) as Order[]}
      adminProfile={profile as Profile}
    />
  )
}
