'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  LayoutDashboard,
  Clock,
  CheckCircle,
  Truck,
  Award,
  RefreshCw,
  LogOut,
  Bell,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import OrderCard from '@/components/admin/OrderCard'
import NewOrderAlert from '@/components/admin/NewOrderAlert'
import type { Order, OrderStatus, Profile } from '@/types'

interface Props {
  initialOrders: Order[]
  adminProfile: Profile
}

const STATUS_FILTERS = [
  { value: 'all', label: 'الكل', icon: LayoutDashboard },
  { value: 'pending', label: 'انتظار', icon: Clock },
  { value: 'confirmed', label: 'مؤكد', icon: CheckCircle },
  { value: 'on_delivery', label: 'توصيل', icon: Truck },
  { value: 'finished', label: 'مكتمل', icon: Award },
] as const

export default function AdminDashboardClient({ initialOrders, adminProfile }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [newOrder, setNewOrder] = useState<Order | null>(null)
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = createClient()

  // ── Supabase Realtime subscription ───────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const incoming = payload.new as Order
          setOrders((prev) => [incoming, ...prev])
          setNewOrder(incoming)
          setNewOrderIds((prev) => new Set(prev).add(incoming.id))
          // Remove "new" highlight after 30 seconds
          setTimeout(() => {
            setNewOrderIds((prev) => {
              const next = new Set(prev)
              next.delete(incoming.id)
              return next
            })
          }, 30_000)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const updated = payload.new as Order
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? updated : o))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // ── Manual refresh ────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) setOrders(data as Order[])
    setIsRefreshing(false)
  }, [supabase])

  // ── Status change handler ─────────────────────────────────────
  const handleStatusChange = useCallback(async (id: string, status: OrderStatus) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    )

    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        // Revert optimistic update on failure
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single()
        if (data) {
          setOrders((prev) => prev.map((o) => (o.id === id ? (data as Order) : o)))
        }
      }
    } catch {
      console.error('Failed to update order status')
    }
  }, [supabase])

  // ── Sign out ──────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // ── Computed stats ────────────────────────────────────────────
  const stats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    on_delivery: orders.filter((o) => o.status === 'on_delivery').length,
    finished: orders.filter((o) => o.status === 'finished').length,
    revenue: orders
      .filter((o) => o.status === 'finished')
      .reduce((sum, o) => sum + Number(o.total_amount), 0),
  }

  // ── Filtered orders ───────────────────────────────────────────
  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.status === filterStatus)

  return (
    <div className="min-h-screen bg-ninja-gray">
      {/* New order alert */}
      <AnimatePresence>
        {newOrder && (
          <NewOrderAlert order={newOrder} onDismiss={() => setNewOrder(null)} />
        )}
      </AnimatePresence>

      {/* Navbar */}
      <header className="bg-ninja-red shadow-ninja sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥷</span>
            <div>
              <span className="font-black text-white text-lg">NINJA</span>{' '}
              <span className="font-black text-ninja-yellow text-lg">BURGER</span>
            </div>
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2 text-white/80 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>مباشر</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="تحديث"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
            >
              القائمة
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
              title="تسجيل خروج"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-ninja-dark">
            مرحباً، {adminProfile.full_name} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            لوحة تحكم الطلبات — يتم التحديث تلقائياً عند ورود طلبات جديدة
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'قيد الانتظار', value: stats.pending, color: 'bg-red-50 border-red-200 text-red-700', dot: 'bg-red-500' },
            { label: 'مؤكدة', value: stats.confirmed, color: 'bg-yellow-50 border-yellow-200 text-yellow-700', dot: 'bg-yellow-500' },
            { label: 'في التوصيل', value: stats.on_delivery, color: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-500' },
            { label: 'مكتملة', value: stats.finished, color: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-500' },
            {
              label: 'إجمالي الإيرادات',
              value: `${stats.revenue.toLocaleString()} ج`,
              color: 'bg-ninja-red/5 border-ninja-red/20 text-ninja-red',
              dot: 'bg-ninja-red',
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className={`bg-white border rounded-2xl p-4 shadow-card ${stat.color}`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${stat.dot}`} />
                <span className="text-xs font-semibold opacity-80">{stat.label}</span>
              </div>
              <div className="text-2xl font-black">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {STATUS_FILTERS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setFilterStatus(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 border-2 ${
                filterStatus === value
                  ? 'bg-ninja-red text-white border-ninja-red shadow-ninja'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-ninja-red hover:text-ninja-red'
              }`}
            >
              <Icon size={15} />
              {label}
              {value !== 'all' && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    filterStatus === value
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {orders.filter((o) => value === 'all' || o.status === value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl">📭</span>
            <p className="text-gray-400 mt-4 font-semibold">لا توجد طلبات في هذه الفئة</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  <OrderCard
                    order={order}
                    onStatusChange={handleStatusChange}
                    isNew={newOrderIds.has(order.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
