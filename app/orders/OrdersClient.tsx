'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle2, Truck, Award, Bell, MapPin, Calendar, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'

interface OrdersClientProps {
  initialOrders: Order[]
  userId: string
}

const STATUS_STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'pending', label: 'انتظار', icon: Clock },
  { status: 'confirmed', label: 'تم التأكيد', icon: CheckCircle2 },
  { status: 'on_delivery', label: 'في التوصيل', icon: Truck },
  { status: 'finished', label: 'مكتمل', icon: Award },
]

function getStepIndex(status: OrderStatus): number {
  return STATUS_STEPS.findIndex((s) => s.status === status)
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function playStatusSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15) // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch {}
}

export default function OrdersClient({ initialOrders, userId }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const handleCancelOrder = async (orderId: string, orderNumber: number) => {
    const confirmCancel = window.confirm(
      `هل أنت متأكد من رغبتك في إلغاء طلبك #${String(orderNumber).padStart(4, '0')}؟\nلن يتم تحضير الطلب أو إرساله.`
    )
    if (!confirmCancel) return

    setCancellingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'تعذر إلغاء الطلب')
        return
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
      )
      setToastMessage(`تم إلغاء طلبك #${String(orderNumber).padStart(4, '0')} بنجاح`)
      setTimeout(() => setToastMessage(null), 5000)
    } catch {
      alert('حدث خطأ في الاتصال أثناء محاولة إلغاء الطلب')
    } finally {
      setCancellingId(null)
    }
  }
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to real-time updates for this user's orders
    const channel = supabase
      .channel(`customer-orders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Order
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            )
            const statusLabel = ORDER_STATUS_LABELS[updated.status]
            setToastMessage(`🔔 تم تحديث حالة طلبك #${String(updated.order_number).padStart(4, '0')} إلى: ${statusLabel}`)
            playStatusSound()
            setTimeout(() => setToastMessage(null), 6000)
          } else if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order
            setOrders((prev) => [newOrder, ...prev])
            setToastMessage(`🎉 تم استلام طلبك #${String(newOrder.order_number).padStart(4, '0')} بنجاح!`)
            setTimeout(() => setToastMessage(null), 6000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Toast Alert for live status updates */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-ninja-dark text-white px-5 py-4 rounded-2xl shadow-2xl border-2 border-ninja-yellow flex items-center gap-3"
            dir="rtl"
          >
            <div className="w-10 h-10 rounded-full bg-ninja-yellow/20 text-ninja-yellow flex items-center justify-center shrink-0">
              <Bell size={20} className="animate-bounce" />
            </div>
            <p className="font-bold text-sm leading-relaxed">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ninja-dark">
            طلباتي 📦
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            {orders.length > 0
              ? `${orders.length} طلب في سجلّك · تحديث تلقائي مباشر`
              : 'لا توجد طلبات بعد'}
          </p>
        </div>
        <Link href="/" className="btn-primary py-2 px-4 text-xs sm:text-sm shrink-0">
          🍔 اطلب الآن
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl shadow-sm border border-gray-100">
          <span className="text-6xl select-none">🛒</span>
          <h2 className="text-xl font-bold text-ninja-dark mt-4">لا توجد طلبات بعد</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6 max-w-xs mx-auto">
            اكتشف قائمتنا المميزة من سندوتشات السماش برجر واطلب الآن!
          </p>
          <Link href="/" className="btn-primary inline-flex px-8">
            تصفح القائمة
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const currentStepIdx = getStepIndex(order.status)
            return (
              <motion.div
                key={order.id}
                layout
                className="bg-white rounded-2xl sm:rounded-3xl shadow-card border border-gray-100 overflow-hidden transition-shadow hover:shadow-ninja-lg"
              >
                {/* Header info */}
                <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-ninja-red text-white font-black text-sm sm:text-base w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-ninja">
                      #{String(order.order_number).padStart(4, '0').slice(-4)}
                    </div>
                    <div>
                      <div className="font-extrabold text-ninja-dark text-base sm:text-lg">
                        طلب #{String(order.order_number).padStart(4, '0')}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5">
                        <Calendar size={13} />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`status-badge text-xs sm:text-sm font-bold px-3 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>

                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order.id, order.order_number)}
                        disabled={cancellingId === order.id}
                        className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="إلغاء الطلب قبل بدء التحضير"
                      >
                        {cancellingId === order.id ? (
                          <span>جاري الإلغاء...</span>
                        ) : (
                          <>
                            <XCircle size={13} />
                            <span>إلغاء الطلب</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Real-time Visual Progress Stepper or Cancelled Banner */}
                {order.status === 'cancelled' ? (
                  <div className="mx-4 sm:mx-6 my-4 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3 text-gray-700">
                    <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <XCircle size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">تم إلغاء هذا الطلب</p>
                      <p className="text-gray-500 text-xs mt-0.5">تم إلغاء تجهيز هذا الطلب ولن يتم احتسابه أو توصيله.</p>
                    </div>
                  </div>
                ) : (
                <div className="px-4 sm:px-6 pt-5 pb-3">
                  <div className="relative flex items-center justify-between">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 start-3 end-3 -translate-y-1/2 h-1 bg-gray-200 -z-0" />
                    <div
                      className="absolute top-1/2 start-3 -translate-y-1/2 h-1 bg-gradient-to-r from-ninja-red to-ninja-yellow transition-all duration-700 -z-0"
                      style={{
                        width: `${(Math.max(0, currentStepIdx) / (STATUS_STEPS.length - 1)) * 100}%`,
                      }}
                    />

                    {STATUS_STEPS.map((step, idx) => {
                      const StepIcon = step.icon
                      const isCompleted = idx <= currentStepIdx
                      const isCurrent = idx === currentStepIdx

                      return (
                        <div key={step.status} className="relative z-10 flex flex-col items-center">
                          <motion.div
                            animate={isCurrent ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                            transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                              isCompleted
                                ? isCurrent
                                  ? 'bg-ninja-red text-white ring-4 ring-red-100 shadow-ninja'
                                  : 'bg-green-600 text-white'
                                : 'bg-white border-2 border-gray-300 text-gray-400'
                            }`}
                          >
                            <StepIcon size={16} />
                          </motion.div>
                          <span
                            className={`text-[10px] sm:text-xs font-bold mt-1.5 whitespace-nowrap ${
                              isCurrent
                                ? 'text-ninja-red font-black'
                                : isCompleted
                                ? 'text-gray-700'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                )}

                {/* Items snapshot */}
                <div className="p-4 sm:p-5 pt-3">
                  <div className="bg-gray-50 rounded-2xl p-3 sm:p-4 mb-3">
                    <ul className="divide-y divide-gray-200/60">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between text-xs sm:text-sm gap-2">
                          <div>
                            <div className="font-bold text-ninja-dark flex items-center gap-1.5">
                              <span>{item.name_ar}</span>
                              <span className="text-gray-400 font-normal">·</span>
                              <span className="text-gray-600 font-normal text-xs bg-white px-2 py-0.5 rounded-md border border-gray-200">
                                {item.size === 'single'
                                  ? 'سنجل'
                                  : item.size === 'double'
                                  ? 'دابل'
                                  : 'تريبل'}
                              </span>
                            </div>
                            {item.addons && item.addons.length > 0 && (
                              <div className="text-gray-500 text-xs mt-1">
                                + {item.addons.map((a) => a.name_ar).join(', ')}
                              </div>
                            )}
                          </div>
                          <div className="text-left shrink-0 font-bold text-ninja-dark whitespace-nowrap">
                            <span className="text-gray-400 font-normal text-xs">{item.quantity} × </span>
                            <span>{item.lineTotal} ج</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Notes if available */}
                  {order.notes && (
                    <div className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200/60 rounded-xl px-3 py-2 mb-3">
                      <span className="font-bold text-yellow-800">ملاحظات: </span>
                      {order.notes}
                    </div>
                  )}

                  {/* Address & Total */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                      <MapPin size={14} className="text-ninja-red shrink-0" />
                      <span className="truncate">{order.delivery_address}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 text-left">
                      <span className="text-xs text-gray-400">الإجمالي:</span>
                      <span className="font-black text-xl text-ninja-red">
                        {Number(order.total_amount).toFixed(0)} ج
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
