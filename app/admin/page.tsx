import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'
import type { Order, Profile, MenuItem, Category } from '@/types'

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

  // Fetch initial orders, menu items, and categories in parallel
  const [{ data: orders }, { data: menuItems }, { data: categories }] =
    await Promise.all([
      adminClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      adminClient
        .from('menu_items')
        .select('*, category:categories(id, name_ar, name_en)')
        .order('sort_order', { ascending: true }),
      adminClient.from('categories').select('*').order('sort_order', { ascending: true }),
    ])

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
      initialMenuItems={(menuItems as MenuItem[]) || []}
      categories={(categories as Category[]) || []}
      adminProfile={profile as Profile}
    />
  )
}
