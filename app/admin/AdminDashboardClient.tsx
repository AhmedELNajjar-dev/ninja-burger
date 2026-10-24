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
  XCircle,
  UtensilsCrossed,
  PackageCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { OrderCard } from '@/components/admin/OrderCard'
import { NewOrderAlert } from '@/components/admin/NewOrderAlert'
import { EditOrderModal } from '@/components/admin/EditOrderModal'
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal'
import { AdminMenuManagement } from '@/components/admin/AdminMenuManagement'
import type { Order, OrderStatus, Profile, MenuItem, Category, Addon } from '@/types'

interface Props {
  initialOrders: Order[]
  initialMenuItems: MenuItem[]
  categories: Category[]
  initialAddons?: Addon[]
  adminProfile: Profile
}

const STATUS_FILTERS = [
  { value: 'all', label: 'الكل', icon: LayoutDashboard },
  { value: 'pending', label: 'انتظار', icon: Clock },
  { value: 'confirmed', label: 'مؤكد', icon: CheckCircle },
  { value: 'on_delivery', label: 'توصيل', icon: Truck },
  { value: 'finished', label: 'مكتمل', icon: Award },
  { value: 'cancelled', label: 'ملغي', icon: XCircle },
] as const

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  on_delivery: 'جاري التوصيل',
  finished: 'مكتمل',
  cancelled: 'ملغي',
}

export default function AdminDashboardClient({
  initialOrders,
  initialMenuItems,
  categories,
  initialAddons = [],
  adminProfile,
}: Props) {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders')
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [newOrder, setNewOrder] = useState<Order | null>(null)
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Order action modals state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [isDeletingOrder, setIsDeletingOrder] = useState(false)

  const supabase = createClient()

  // ── Supabase Realtime subscription for orders ───────────────────────────
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
            prev.map((o) =>
              o.id === updated.id
                ? {
                    ...o,
                    ...updated,
                    is_first_order:
                      updated.is_first_order !== undefined
                        ? updated.is_first_order
                        : o.is_first_order,
                  }
                : o
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const deleted = payload.old as { id: string }
          setOrders((prev) => prev.filter((o) => o.id !== deleted.id))
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
    if (data) {
      const phoneCounts: Record<string, number> = {}
      data.forEach((o: any) => {
        if (o.customer_phone) {
          phoneCounts[o.customer_phone] = (phoneCounts[o.customer_phone] ?? 0) + 1
        }
      })
      const ordersWithFlags: Order[] = data.map((o: any) => ({
        ...o,
        is_first_order: (phoneCounts[o.customer_phone] ?? 1) === 1,
      }))
      setOrders(ordersWithFlags)
    }
    setIsRefreshing(false)
  }, [supabase])

  // ── Status change handler ─────────────────────────────────────
  const handleStatusChange = useCallback(async (id: string, status: OrderStatus) => {
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
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single()
        if (data) {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === id ? { ...o, ...(data as Order), is_first_order: o.is_first_order } : o
            )
          )
        }
      }
    } catch {
      console.error('Failed to update order status')
    }
  }, [supabase])

  // ── Handle Order Update from Edit Modal ───────────────────────
  const handleOrderUpdated = (updated: Order) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === updated.id
          ? {
              ...o,
              ...updated,
              is_first_order:
                updated.is_first_order !== undefined
                  ? updated.is_first_order
                  : o.is_first_order,
            }
          : o
      )
    )
  }

  // ── Handle Order Delete Execution ─────────────────────────────
  const handleConfirmDeleteOrder = async () => {
    if (!deletingOrder) return
    setIsDeletingOrder(true)

    try {
      const res = await fetch(`/api/admin/orders/${deletingOrder.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== deletingOrder.id))
        setDeletingOrder(null)
      } else {
        alert('فشل حذف الطلب من قاعدة البيانات')
      }
    } catch {
      alert('حدث خطأ أثناء محاولة حذف الطلب')
    } finally {
      setIsDeletingOrder(false)
    }
  }

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
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    revenue: orders
      .filter((o) => o.status === 'finished')
      .reduce((sum, o) => sum + Number(o.total_amount), 0),
  }

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.status === filterStatus)

  return (
    <div className="min-h-screen bg-ninja-gray" dir="rtl">
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
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-white/80 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>مباشر</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
            >
              عرض الموقع
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors cursor-pointer"
              title="تسجيل خروج"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome & Section Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-ninja-dark leading-tight">
              لوحة إدارة نينجا برجر 👋
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              مرحباً {adminProfile.full_name} — يمكنك إدارة وتعديل الطلبات وقائمة الطعام وحالة التوفر
            </p>
          </div>

          {/* Master Tabs: Orders vs Menu */}
          <div className="inline-flex p-1 bg-white rounded-2xl border border-gray-200 shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-ninja-red text-white shadow-ninja'
                  : 'text-gray-600 hover:text-ninja-dark'
              }`}
            >
              <PackageCheck size={18} />
              <span>الطلبات</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  activeTab === 'orders'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-ninja-red text-white shadow-ninja'
                  : 'text-gray-600 hover:text-ninja-dark'
              }`}
            >
              <UtensilsCrossed size={18} />
              <span>قائمة الطعام والأصناف</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  activeTab === 'menu'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {initialMenuItems.length}
              </span>
            </button>
          </div>
        </div>

        {/* ── Tab 1: Orders Management ─────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div>
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                { label: 'قيد الانتظار', value: stats.pending, color: 'bg-red-50 border-red-200 text-red-700', dot: 'bg-red-500' },
                { label: 'مؤكدة', value: stats.confirmed, color: 'bg-yellow-50 border-yellow-200 text-yellow-700', dot: 'bg-yellow-500' },
                { label: 'في التوصيل', value: stats.on_delivery, color: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-500' },
                { label: 'مكتملة', value: stats.finished, color: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-500' },
                { label: 'ملغية', value: stats.cancelled, color: 'bg-gray-50 border-gray-200 text-gray-500', dot: 'bg-gray-400' },
                {
                  label: 'إجمالي الإيرادات',
                  value: `${stats.revenue.toLocaleString()} ج`,
                  color: 'bg-ninja-red/5 border-ninja-red/20 text-ninja-red col-span-2 sm:col-span-1',
                  dot: 'bg-ninja-red',
                },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className={`bg-white border rounded-2xl p-3 sm:p-4 shadow-card ${stat.color}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-2 h-2 rounded-full ${stat.dot}`} />
                    <span className="text-[11px] sm:text-xs font-semibold opacity-85">{stat.label}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black">{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
              {STATUS_FILTERS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setFilterStatus(value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 border-2 cursor-pointer ${
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
                      {orders.filter((o) => o.status === value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Orders list */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-150 p-6">
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
                        onEditOrder={(o) => setEditingOrder(o)}
                        onDeleteOrder={(o) => setDeletingOrder(o)}
                        isNew={newOrderIds.has(order.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Menu Items Management (CRUD) ──────────────────────── */}
        {activeTab === 'menu' && (
          <AdminMenuManagement
            initialItems={initialMenuItems}
            categories={categories}
            initialAddons={initialAddons}
          />
        )}
      </div>

      {/* Edit Order Modal with diff verification */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          isOpen={true}
          onClose={() => setEditingOrder(null)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}

      {/* Mandatory Delete Order Modal with Previous Status */}
      {deletingOrder && (
        <DeleteConfirmModal
          isOpen={true}
          title={`حذف الطلب #${String(deletingOrder.order_number).padStart(4, '0')} نهائياً`}
          warningMessage="سيتم حذف هذا الطلب نهائياً من سجلات النظام وإرسال تنبيه فوري إلى قناة المطبخ مع حالته المسجلة قبل الحذف."
          details={[
            {
              label: 'حالة الطلب قبل الحذف',
              value: (
                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
                  {STATUS_LABELS[deletingOrder.status] || deletingOrder.status}
                </span>
              ),
            },
            { label: 'رقم الطلب', value: `#${String(deletingOrder.order_number).padStart(4, '0')}` },
            { label: 'اسم العميل', value: deletingOrder.customer_name },
            { label: 'رقم الهاتف', value: deletingOrder.customer_phone },
            { label: 'عنوان التوصيل', value: deletingOrder.delivery_address },
            { label: 'إجمالي الحساب', value: `${deletingOrder.total_amount} ج` },
            {
              label: 'عدد الأصناف',
              value: `${deletingOrder.items.reduce((s, i) => s + (i.quantity || 1), 0)} قطعة`,
            },
          ]}
          isSubmitting={isDeletingOrder}
          onConfirm={handleConfirmDeleteOrder}
          onCancel={() => setDeletingOrder(null)}
        />
      )}
    </div>
  )
}
