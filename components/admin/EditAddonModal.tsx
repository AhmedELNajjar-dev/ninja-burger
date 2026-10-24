'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Edit3, DollarSign, CheckCircle2, XCircle } from 'lucide-react'
import { Addon } from '@/types'
import { DiffConfirmModal, ChangeDiff } from './DiffConfirmModal'

interface EditAddonModalProps {
  addon: Addon | null
  isOpen: boolean
  onClose: () => void
  onAddonUpdated: (updatedAddon: Addon) => void
}

export function EditAddonModal({
  addon,
  isOpen,
  onClose,
  onAddonUpdated,
}: EditAddonModalProps) {
  if (!isOpen || !addon) return null

  const [price, setPrice] = useState(addon.price.toString())
  const [isAvailable, setIsAvailable] = useState<boolean>(
    addon.is_available !== undefined ? addon.is_available : true
  )
  const [nameAr, setNameAr] = useState(addon.name_ar)
  const [nameEn, setNameEn] = useState(addon.name_en)

  const [pendingDiffs, setPendingDiffs] = useState<ChangeDiff[] | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const numPrice = Number(price)
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('سعر الإضافة يجب أن يكون رقماً صحيحاً أكبر من صفر')
      return
    }

    // Compute diffs
    const diffs: ChangeDiff[] = []

    if (numPrice !== addon.price) {
      diffs.push({
        field: 'سعر الإضافة',
        oldVal: `${addon.price} ج`,
        newVal: `${numPrice} ج`,
      })
    }

    const prevAvail = addon.is_available !== undefined ? addon.is_available : true
    if (isAvailable !== prevAvail) {
      diffs.push({
        field: 'حالة التوفر للطلب',
        oldVal: prevAvail ? 'متوفر للطلب' : 'غير متوفر',
        newVal: isAvailable ? 'متوفر للطلب' : 'غير متوفر',
      })
    }

    if (nameAr.trim() !== addon.name_ar) {
      diffs.push({
        field: 'الاسم بالعربية',
        oldVal: addon.name_ar,
        newVal: nameAr.trim(),
      })
    }

    if (nameEn.trim() !== addon.name_en) {
      diffs.push({
        field: 'الاسم بالإنجليزية',
        oldVal: addon.name_en,
        newVal: nameEn.trim(),
      })
    }

    if (diffs.length === 0) {
      alert('لم تقم بتغيير أي بيانات في هذه الإضافة.')
      return
    }

    setPendingDiffs(diffs)
  }

  const handleConfirmPersist = async () => {
    if (!pendingDiffs) return
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/admin/addons/${addon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: Number(price),
          is_available: isAvailable,
          name_ar: nameAr.trim(),
          name_en: nameEn.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || 'فشل تحديث بيانات الإضافة')
        setIsSubmitting(false)
        setPendingDiffs(null)
        return
      }

      onAddonUpdated(data.addon)
      setPendingDiffs(null)
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
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-150 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Edit3 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-ninja-dark leading-tight">
                  تعديل إضافة: {addon.name_ar}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  تعديل السعر وحالة التوفر والاسم
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* Price (EGP) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                سعر الإضافة (بالجنيه المصري) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="input-field pe-9 py-2.5 text-base font-bold"
                />
                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  ج
                </span>
              </div>
            </div>

            {/* Availability Toggle */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                حالة توفر الإضافة للطلب
              </label>
              <button
                type="button"
                onClick={() => setIsAvailable((prev) => !prev)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                  isAvailable
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : 'bg-red-50 text-red-700 border-red-300'
                }`}
              >
                <span>{isAvailable ? '✅ متوفرة ويمكن للعملاء طلبها' : '🚫 غير متوفرة حالياً (موقوفة)'}</span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border shadow-xs font-mono">
                  تغيير
                </span>
              </button>
            </div>

            {/* Names (Arabic & English) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  الاسم بالعربية
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  required
                  className="input-field py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1 text-left" dir="ltr">
                  Name (English)
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  required
                  dir="ltr"
                  className="input-field py-2 text-xs"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-150">
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
                <span>مراجعة وتأكيد التعديلات</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Mandatory Diff Modal */}
      {pendingDiffs && (
        <DiffConfirmModal
          isOpen={true}
          title={`تأكيد تعديل إضافة: ${addon.name_ar}`}
          description="يرجى مراجعة التغييرات أدناه قبل الحفظ. ستظهر التعديلات للعملاء فوراً على الموقع."
          changes={pendingDiffs}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmPersist}
          onCancel={() => setPendingDiffs(null)}
        />
      )}
    </>
  )
}
