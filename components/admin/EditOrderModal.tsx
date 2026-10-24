'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Edit3, User, Phone, MapPin, FileText } from 'lucide-react'
import { Order, OrderStatus } from '@/types'
import { DiffConfirmModal, ChangeDiff } from './DiffConfirmModal'

interface EditOrderModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onOrderUpdated: (updatedOrder: Order) => void
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'قيد الانتظار ⏳' },
  { value: 'confirmed', label: 'مؤكد وتم الاستلام ✅' },
  { value: 'on_delivery', label: 'جاري التوصيل 🛵' },
  { value: 'finished', label: 'مكتمل ومستلم 🎉' },
  { value: 'cancelled', label: 'ملغي ❌' },
]

export function EditOrderModal({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}: EditOrderModalProps) {
  if (!isOpen || !order) return null

  const [customerName, setCustomerName] = useState(order.customer_name)
  const [customerPhone, setCustomerPhone] = useState(order.customer_phone)
  const [deliveryAddress, setDeliveryAddress] = useState(order.delivery_address)
  const [notes, setNotes] = useState(order.notes || '')
  const [status, setStatus] = useState<OrderStatus>(order.status)

  const [pendingChanges, setPendingChanges] = useState<ChangeDiff[] | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Compute diff
    const diffs: ChangeDiff[] = []

    if (customerName.trim() !== order.customer_name) {
      diffs.push({
        field: 'اسم العميل',
        oldVal: order.customer_name,
        newVal: customerName.trim(),
      })
    }

    if (customerPhone.trim() !== order.customer_phone) {
      diffs.push({
        field: 'رقم الهاتف',
        oldVal: order.customer_phone,
        newVal: customerPhone.trim(),
      })
    }

    if (deliveryAddress.trim() !== order.delivery_address) {
      diffs.push({
        field: 'عنوان التوصيل',
        oldVal: order.delivery_address,
        newVal: deliveryAddress.trim(),
      })
    }

    if (notes.trim() !== (order.notes || '').trim()) {
      diffs.push({
        field: 'ملاحظات الطلب',
        oldVal: order.notes || '(بدون ملاحظات)',
        newVal: notes.trim() || '(تم الحذف)',
      })
    }

    if (status !== order.status) {
      const getLabel = (s: OrderStatus) => STATUS_OPTIONS.find((o) => o.value === s)?.label || s
      diffs.push({
        field: 'حالة الطلب',
        oldVal: getLabel(order.status),
        newVal: getLabel(status),
      })
    }

    if (diffs.length === 0) {
      alert('لم تقم بإجراء أي تعديل على بيانات الطلب.')
      return
    }

    setPendingChanges(diffs)
  }

  const handleConfirmPersist = async () => {
    if (!pendingChanges) return
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          delivery_address: deliveryAddress.trim(),
          notes: notes.trim(),
          status,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || 'فشل تحديث الطلب')
        setIsSubmitting(false)
        setPendingChanges(null)
        return
      }

      onOrderUpdated(data.order)
      setPendingChanges(null)
      onClose()
    } catch {
      setErrorMessage('حدث خطأ في الاتصال بالخادم')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-150 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Edit3 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-ninja-dark leading-tight">
                  تعديل الطلب #{String(order.order_number).padStart(4, '0')}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  تعديل بيانات العميل، العنوان، أو الحالة مع إشعار المطبخ فورياً
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto scrollbar-ninja flex-1">
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                حالة الطلب
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="input-field py-2.5 text-sm font-bold bg-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                اسم العميل
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="input-field pe-9 py-2.5 text-sm"
                />
                <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                رقم الهاتف
              </label>
              <div className="relative" dir="ltr">
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  className="input-field pl-10 pr-3 py-2.5 text-sm font-mono"
                />
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                عنوان التوصيل
              </label>
              <div className="relative">
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                  rows={2}
                  className="input-field pe-9 py-2 text-sm leading-relaxed"
                />
                <MapPin size={16} className="absolute start-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                ملاحظات إضافية
              </label>
              <div className="relative">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="بدون ملاحظات"
                  className="input-field pe-9 py-2 text-sm"
                />
                <FileText size={16} className="absolute start-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Footer actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5"
              >
                <Save size={16} />
                <span>مراجعة وتأكيد التغييرات</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Mandatory Diff Confirmation Modal */}
      {pendingChanges && (
        <DiffConfirmModal
          isOpen={true}
          title={`تأكيد تعديلات الطلب #${String(order.order_number).padStart(4, '0')}`}
          description="يرجى مراجعة التغييرات أدناه بعناية. سيتم إرسال تنبيه فوري إلى قناة المطبخ على ديسكورد فور التأكيد."
          changes={pendingChanges}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmPersist}
          onCancel={() => setPendingChanges(null)}
        />
      )}
    </>
  )
}
