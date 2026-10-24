'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Edit3, CheckCircle2, XCircle, Plus, Trash2, AlertCircle, Sparkles } from 'lucide-react'
import { Addon, AddonOption } from '@/types'
import { DiffConfirmModal, ChangeDiff } from './DiffConfirmModal'
import { DEFAULT_SAUCE_OPTIONS, DEFAULT_DRINK_OPTIONS } from '@/lib/constants/menuData'

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

  const lowerEn = (addon.name_en || '').toLowerCase()
  const nameArText = addon.name_ar || ''
  const isSauceOrDrink =
    addon.id === 'addon-8' ||
    addon.id === 'addon-10' ||
    lowerEn.includes('sauce') ||
    nameArText.includes('صوص') ||
    lowerEn.includes('drink') ||
    lowerEn.includes('sparkling') ||
    nameArText.includes('غازية') ||
    (addon.options && addon.options.length > 0)

  const [price, setPrice] = useState(addon.price.toString())
  const [isAvailable, setIsAvailable] = useState<boolean>(
    addon.is_available !== undefined ? addon.is_available : true
  )
  const [nameAr, setNameAr] = useState(addon.name_ar)
  const [nameEn, setNameEn] = useState(addon.name_en)

  // Options state (flavors / drinks variants)
  const [options, setOptions] = useState<AddonOption[]>(() => {
    if (addon.options && addon.options.length > 0) {
      return JSON.parse(JSON.stringify(addon.options))
    }
    if (addon.id === 'addon-8' || lowerEn.includes('sauce') || nameArText.includes('صوص')) {
      return JSON.parse(JSON.stringify(DEFAULT_SAUCE_OPTIONS))
    }
    if (addon.id === 'addon-10' || lowerEn.includes('drink') || lowerEn.includes('sparkling') || nameArText.includes('غازية')) {
      return JSON.parse(JSON.stringify(DEFAULT_DRINK_OPTIONS))
    }
    return []
  })

  // New option form state
  const [newOptNameAr, setNewOptNameAr] = useState('')
  const [newOptNameEn, setNewOptNameEn] = useState('')
  const [newOptError, setNewOptError] = useState<string | null>(null)

  const [pendingDiffs, setPendingDiffs] = useState<ChangeDiff[] | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Toggle option availability
  const handleToggleOptionAvailability = (index: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, is_available: !opt.is_available } : opt))
    )
  }

  // Edit option names
  const handleUpdateOptionName = (index: number, field: 'name_ar' | 'name_en', value: string) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    )
  }

  // Delete option
  const handleDeleteOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  // Add new option
  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault()
    setNewOptError(null)

    if (!newOptNameAr.trim()) {
      setNewOptError('اسم الخيار بالعربية مطلوب')
      return
    }
    if (!newOptNameEn.trim()) {
      setNewOptError('اسم الخيار بالإنجليزية مطلوب')
      return
    }

    const newId = `opt-${Date.now()}`
    setOptions((prev) => [
      ...prev,
      {
        id: newId,
        name_ar: newOptNameAr.trim(),
        name_en: newOptNameEn.trim(),
        is_available: true,
      },
    ])
    setNewOptNameAr('')
    setNewOptNameEn('')
  }

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

    // Compare options
    if (isSauceOrDrink) {
      const origOptionsStr = JSON.stringify(addon.options || [])
      const currentOptionsStr = JSON.stringify(options)
      if (origOptionsStr !== currentOptionsStr) {
        diffs.push({
          field: 'خيارات ونكهات الصنف',
          oldVal: `${(addon.options || []).length} خيارات سابقة`,
          newVal: `${options.length} خيارات حالية (تم تحديث الأسماء أو حالة التوفر أو الخيارات)`,
        })
      }
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
      const payload: any = {
        price: Number(price),
        is_available: isAvailable,
        name_ar: nameAr.trim(),
        name_en: nameEn.trim(),
      }

      if (isSauceOrDrink) {
        payload.options = options
      }

      const res = await fetch(`/api/admin/addons/${addon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || 'فشل تحديث بيانات الإضافة')
        setIsSubmitting(false)
        setPendingDiffs(null)
        return
      }

      onAddonUpdated({
        ...addon,
        ...data.addon,
        options: isSauceOrDrink ? options : (data.addon?.options || addon.options),
      })
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
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-150 flex flex-col max-h-[90vh]"
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
                  تعديل السعر وحالة التوفر والخيارات والنكهات
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
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto scrollbar-ninja flex-1">
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
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
                  className="input-field py-2 text-xs font-bold"
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
                  className="input-field py-2 text-xs font-bold"
                />
              </div>
            </div>

            {/* Flavor / Drink Options Management (Sauce Cup & Soft Drinks) */}
            {isSauceOrDrink && (
              <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-600" />
                    <h4 className="text-xs font-black text-ninja-dark">
                      خيارات ونكهات الصنف ({options.length})
                    </h4>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">
                    العميل يختار نكهة واحدة عند الطلب
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 leading-normal">
                  يمكنك تعديل أسماء النكهات، إيقاف توفر نكهة مؤقتاً لتصبح غير قابلة للنقر لدى العميل، أو حذف وإضافة نكهات جديدة.
                </p>

                {/* Existing Options List */}
                <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-ninja pe-1">
                  {options.map((opt, idx) => (
                    <div
                      key={opt.id || idx}
                      className={`p-2.5 rounded-xl border flex flex-col sm:flex-row items-center gap-2 transition-all ${
                        opt.is_available
                          ? 'bg-white border-gray-200'
                          : 'bg-red-50/40 border-red-200 opacity-80'
                      }`}
                    >
                      <div className="flex-1 w-full grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={opt.name_ar}
                          onChange={(e) => handleUpdateOptionName(idx, 'name_ar', e.target.value)}
                          placeholder="الاسم بالعربية"
                          className="input-field py-1 px-2 text-xs font-bold bg-white"
                          required
                        />
                        <input
                          type="text"
                          value={opt.name_en}
                          onChange={(e) => handleUpdateOptionName(idx, 'name_en', e.target.value)}
                          placeholder="Name (EN)"
                          dir="ltr"
                          className="input-field py-1 px-2 text-xs font-bold bg-white"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleToggleOptionAvailability(idx)}
                          className={`py-1 px-2.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1 ${
                            opt.is_available
                              ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                          }`}
                          title="تغيير حالة التوفر للنقر"
                        >
                          {opt.is_available ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          <span>{opt.is_available ? 'متوفر' : 'غير متوفر'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteOption(idx)}
                          className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="حذف هذا الخيار"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {options.length === 0 && (
                    <div className="p-3 text-center text-xs text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                      لا توجد خيارات حالياً. أضف خيارات أدناه.
                    </div>
                  )}
                </div>

                {/* Add New Option Sub-form */}
                <div className="pt-2 border-t border-amber-200/80">
                  <span className="block text-[11px] font-bold text-ninja-dark mb-1.5">
                    + إضافة خيار / نكهة جديدة:
                  </span>
                  {newOptError && (
                    <p className="text-[10px] text-red-600 mb-1.5">{newOptError}</p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <input
                      type="text"
                      value={newOptNameAr}
                      onChange={(e) => setNewOptNameAr(e.target.value)}
                      placeholder="اسم النكهة (عربي)"
                      className="input-field py-1.5 px-2.5 text-xs flex-1 w-full bg-white"
                    />
                    <input
                      type="text"
                      value={newOptNameEn}
                      onChange={(e) => setNewOptNameEn(e.target.value)}
                      placeholder="Flavor (EN)"
                      dir="ltr"
                      className="input-field py-1.5 px-2.5 text-xs flex-1 w-full bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 flex items-center gap-1 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <Plus size={14} />
                      <span>إضافة</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-150">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-ninja"
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
