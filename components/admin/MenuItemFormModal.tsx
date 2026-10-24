'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Check, Image as ImageIcon, AlertCircle, Save, Plus } from 'lucide-react'
import { MenuItem, Category } from '@/types'
import { getLocalizedDescription } from '@/lib/menuTranslations'
import { DiffConfirmModal, ChangeDiff } from './DiffConfirmModal'

interface MenuItemFormModalProps {
  item?: MenuItem | null // If present, edit mode; otherwise, create mode
  categories: Category[]
  isOpen: boolean
  onClose: () => void
  onSaved: (savedItem: MenuItem) => void
}

export function MenuItemFormModal({
  item,
  categories,
  isOpen,
  onClose,
  onSaved,
}: MenuItemFormModalProps) {
  if (!isOpen) return null

  const isEdit = !!item

  // Mandatory fields
  const [nameAr, setNameAr] = useState(item?.name_ar || '')
  const [nameEn, setNameEn] = useState(item?.name_en || '')
  const [descriptionAr, setDescriptionAr] = useState(item?.description_ar || '')
  const initialDescEn = item?.description_en || ''
  const [descriptionEn, setDescriptionEn] = useState(initialDescEn)
  const [categoryId, setCategoryId] = useState(item?.category_id || (categories[0]?.id || ''))

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const isFriesCategory =
    selectedCategory?.id === 'cat-fries' ||
    selectedCategory?.name_en?.toLowerCase().includes('fries') ||
    selectedCategory?.name_ar?.includes('فرايز') ||
    selectedCategory?.name_ar?.includes('بطاطس')
  const [priceSingle, setPriceSingle] = useState(item?.price_single?.toString() || '')
  const [priceDouble, setPriceDouble] = useState(item?.price_double?.toString() || '')
  const [priceTriple, setPriceTriple] = useState(item?.price_triple?.toString() || '')
  const [imageUrl, setImageUrl] = useState(item?.image_url || '')
  const [isAvailable, setIsAvailable] = useState<boolean>(item ? item.is_available : true)
  const [sortOrder, setSortOrder] = useState<number>(item?.sort_order ?? 0)

  // Uploading state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Submitting state
  const [pendingDiffs, setPendingDiffs] = useState<ChangeDiff[] | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Handle image upload to Supabase Storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('حجم الصورة يجب ألا يتجاوز 5 ميجابايت')
      return
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowed.includes(file.type)) {
      setUploadError('نوع الصورة غير مدعوم (JPEG, PNG, WebP فقط)')
      return
    }

    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch('/api/admin/menu/upload', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()

      if (!res.ok) {
        setUploadError(data.error || 'فشل رفع الصورة')
        return
      }

      setImageUrl(data.url)
    } catch {
      setUploadError('حدث خطأ أثناء رفع الصورة إلى الخادم')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validate ALL fields are mandatory
    if (!nameAr.trim() || nameAr.trim().length < 2) {
      setFormError('الاسم بالعربية مطلوب وإلزامي (حرفين على الأقل)')
      return
    }
    if (!nameEn.trim() || nameEn.trim().length < 2) {
      setFormError('الاسم بالإنجليزية مطلوب وإلزامي (حرفين على الأقل)')
      return
    }
    if (!descriptionAr.trim() || descriptionAr.trim().length < 5) {
      setFormError('الوصف بالعربية مطلوب وإلزامي (5 أحرف على الأقل)')
      return
    }
    if (!descriptionEn.trim() || descriptionEn.trim().length < 5) {
      setFormError('الوصف بالإنجليزية مطلوب وإلزامي (5 أحرف على الأقل)')
      return
    }
    if (!categoryId) {
      setFormError('يرجى اختيار القسم (إلزامي)')
      return
    }

    const pSingle = Number(priceSingle)
    const pDouble = priceDouble ? Number(priceDouble) : null
    const pTriple = priceTriple ? Number(priceTriple) : null

    if (isNaN(pSingle) || pSingle <= 0) {
      setFormError('سعر الصنف (سنجل) مطلوب وإلزامي وأكبر من صفر')
      return
    }
    if (!isFriesCategory) {
      if (!pDouble || isNaN(pDouble) || pDouble <= 0) {
        setFormError('سعر الدابل مطلوب وإلزامي لسندوتشات البرجر وأكبر من صفر')
        return
      }
      if (!pTriple || isNaN(pTriple) || pTriple <= 0) {
        setFormError('سعر التريبل مطلوب وإلزامي لسندوتشات البرجر وأكبر من صفر')
        return
      }
    }
    if (!imageUrl.trim()) {
      setFormError('يرجى رفع صورة الصنف (الصورة إلزامية)')
      return
    }

    // Compute Diffs
    const diffs: ChangeDiff[] = []

    if (isEdit && item) {
      if (nameAr.trim() !== item.name_ar) {
        diffs.push({ field: 'الاسم بالعربية', oldVal: item.name_ar, newVal: nameAr.trim() })
      }
      if (nameEn.trim() !== item.name_en) {
        diffs.push({ field: 'الاسم بالإنجليزية', oldVal: item.name_en, newVal: nameEn.trim() })
      }
      if (descriptionAr.trim() !== (item.description_ar || '')) {
        diffs.push({ field: 'الوصف بالعربية', oldVal: item.description_ar || '', newVal: descriptionAr.trim() })
      }
      if (descriptionEn.trim() !== (item.description_en || '')) {
        diffs.push({ field: 'الوصف بالإنجليزية', oldVal: item.description_en || '', newVal: descriptionEn.trim() })
      }
      if (categoryId !== item.category_id) {
        const oldCat = categories.find((c) => c.id === item.category_id)?.name_ar || item.category_id
        const newCat = categories.find((c) => c.id === categoryId)?.name_ar || categoryId
        diffs.push({ field: 'القسم', oldVal: oldCat, newVal: newCat })
      }
      if (isFriesCategory) {
        if (pSingle !== item.price_single) {
          diffs.push({ field: 'سعر الفرايز', oldVal: `${item.price_single} ج`, newVal: `${pSingle} ج` })
        }
      } else {
        if (pSingle !== item.price_single) {
          diffs.push({ field: 'سعر السنجل', oldVal: `${item.price_single} ج`, newVal: `${pSingle} ج` })
        }
        if (pDouble !== (item.price_double ?? null)) {
          diffs.push({ field: 'سعر الدابل', oldVal: `${item.price_double ?? '-'} ج`, newVal: `${pDouble ?? '-'} ج` })
        }
        if (pTriple !== (item.price_triple ?? null)) {
          diffs.push({ field: 'سعر التريبل', oldVal: `${item.price_triple ?? '-'} ج`, newVal: `${pTriple ?? '-'} ج` })
        }
      }
      if (imageUrl !== item.image_url) {
        diffs.push({ field: 'صورة الصنف', oldVal: '(صورة سابقة)', newVal: '(صورة جديدة تم رفعها)' })
      }
      if (isAvailable !== item.is_available) {
        diffs.push({
          field: 'حالة التوفر',
          oldVal: item.is_available ? 'متوفر' : 'غير متوفر',
          newVal: isAvailable ? 'متوفر' : 'غير متوفر',
        })
      }

      if (diffs.length === 0) {
        alert('لم تقم بإجراء أي تغييرات على بيانات هذا الصنف.')
        return
      }
    } else {
      // Create mode summary
      diffs.push({ field: 'الاسم بالعربية', oldVal: '(صنف جديد)', newVal: nameAr.trim() })
      diffs.push({ field: 'الاسم بالإنجليزية', oldVal: '-', newVal: nameEn.trim() })
      if (isFriesCategory) {
        diffs.push({ field: 'سعر الفرايز', oldVal: '-', newVal: `${pSingle} ج (حجم موحد)` })
      } else {
        diffs.push({ field: 'الأسعار', oldVal: '-', newVal: `سنجل: ${pSingle} ج | دابل: ${pDouble ?? '-'} ج | تريبل: ${pTriple ?? '-'} ج` })
      }
      diffs.push({ field: 'حالة التوفر', oldVal: '-', newVal: isAvailable ? 'متوفر للطلب' : 'غير متوفر' })
    }

    setPendingDiffs(diffs)
  }

  const handlePersist = async () => {
    setIsSubmitting(true)
    setFormError(null)

    const payload = {
      name_ar: nameAr.trim(),
      name_en: nameEn.trim(),
      description_ar: descriptionAr.trim(),
      description_en: descriptionEn.trim(),
      category_id: categoryId,
      price_single: Number(priceSingle),
      price_double: isFriesCategory ? null : (priceDouble ? Number(priceDouble) : null),
      price_triple: isFriesCategory ? null : (priceTriple ? Number(priceTriple) : null),
      image_url: imageUrl.trim(),
      is_available: isAvailable,
      sort_order: sortOrder,
    }

    try {
      const url = isEdit ? `/api/admin/menu/${item.id}` : '/api/admin/menu'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || 'فشل حفظ الصنف')
        setPendingDiffs(null)
        setIsSubmitting(false)
        return
      }

      onSaved(data.item)
      setPendingDiffs(null)
      onClose()
    } catch {
      setFormError('حدث خطأ في الاتصال بالخادم')
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
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-150 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-ninja-red text-white flex items-center justify-center font-bold shadow-ninja">
                {isEdit ? <Save size={20} /> : <Plus size={20} />}
              </div>
              <div>
                <h3 className="text-lg font-black text-ninja-dark leading-tight">
                  {isEdit ? `تعديل صنف: ${item.name_ar}` : 'إضافة صنف جديد للقائمة'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  جميع الحقول إجبارية ومطلوبة لضمان ظهور الصنف باللغتين العربية والإنجليزية
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
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto scrollbar-ninja flex-1">
            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Names Section (Dual-Language) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-800 mb-1.5">
                  الاسم بالعربية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: نينجا برجر خاص"
                  required
                  className="input-field py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-800 mb-1.5 text-left" dir="ltr">
                  Item Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Ninja Special Burger"
                  dir="ltr"
                  required
                  className="input-field py-2.5 text-sm"
                />
              </div>
            </div>

            {/* Descriptions Section (Dual-Language) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-800 mb-1.5">
                  مكونات الصنف بالعربية <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  rows={3}
                  placeholder="عيش بريوش، صوص تايستي، بصل مكرمل، قطعة برجر..."
                  required
                  className="input-field py-2 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-800 mb-1.5 text-left" dir="ltr">
                  Ingredients (English) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={3}
                  placeholder="Brioche bun, tasty sauce, caramelized onion, beef patty..."
                  dir="ltr"
                  required
                  className="input-field py-2 text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* Category & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-black text-gray-800 mb-1.5">
                  القسم <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="input-field py-2.5 text-sm font-bold bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_ar} ({c.name_en})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-800 mb-1.5">
                  حالة التوفر للطلب <span className="text-red-500">*</span>
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
                  <span>{isAvailable ? '✅ متوفر ويمكن للعملاء طلبه' : '🚫 غير متوفر (مباع / Out of Stock)'}</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border shadow-xs font-mono">
                    تغيير
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Section: Single price field for Fries, 3 tiers for Burgers */}
            {isFriesCategory ? (
              <div className="border border-amber-200/90 rounded-2xl p-4 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-gray-800">
                    سعر الفرايز (بالجنيه المصري) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    حجم وسعر موحد
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal">
                  أصناف قسم الفرايز تأتي بحجم واحد فقط، لذا يتم تحديد سعر واحد فقط للصنف.
                </p>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={priceSingle}
                    onChange={(e) => setPriceSingle(e.target.value)}
                    placeholder="70"
                    required
                    className="input-field py-2.5 text-base text-center font-black"
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">ج</span>
                </div>
              </div>
            ) : (
              <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50/60">
                <label className="block text-xs font-black text-gray-800 mb-2">
                  أسعار الأحجام الثلاثة (جميعها إجبارية بالجنيه المصري) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="block text-[11px] font-bold text-gray-500 mb-1">
                      سعر سنجل (Single)
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={priceSingle}
                        onChange={(e) => setPriceSingle(e.target.value)}
                        placeholder="105"
                        required
                        className="input-field py-2 text-sm text-center font-bold"
                      />
                      <span className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">ج</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-gray-500 mb-1">
                      سعر دابل (Double)
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={priceDouble}
                        onChange={(e) => setPriceDouble(e.target.value)}
                        placeholder="135"
                        required
                        className="input-field py-2 text-sm text-center font-bold"
                      />
                      <span className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">ج</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-gray-500 mb-1">
                      سعر تريبل (Triple)
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={priceTriple}
                        onChange={(e) => setPriceTriple(e.target.value)}
                        placeholder="175"
                        required
                        className="input-field py-2 text-sm text-center font-bold"
                      />
                      <span className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">ج</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

                        {/* Mandatory Image Upload (Supabase Storage) & Responsive Auto-Fit Preview */}
            <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50/60 space-y-3">
              <label className="block text-xs font-black text-gray-800">
                صورة الصنف (رفع إلى Supabase Storage) <span className="text-red-500">*</span>
              </label>

              {uploadError && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  {uploadError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Image Preview with fixed aspect ratio auto-fit */}
                <div className="w-full sm:w-44 h-32 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden relative flex items-center justify-center shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="text-center p-3 text-gray-400">
                      <ImageIcon size={32} className="mx-auto mb-1 opacity-50" />
                      <span className="text-[11px] font-bold">لا توجد صورة</span>
                    </div>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                      جاري الرفع...
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-ninja-dark border border-gray-300 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload size={16} className="text-ninja-red" />
                    <span>{imageUrl ? 'تغيير صورة الصنف' : 'اختر صورة لرفعها'}</span>
                  </button>

                  <p className="text-[11px] text-gray-400 leading-normal">
                    الأنواع المدعومة: PNG, JPG, WebP (بحد أقصى 5MB). يتم ضبط أبعاد الصورة تلقائياً وبشكل متجاوب بدون أي تمطيط.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-1.5 shadow-ninja"
              >
                <Save size={16} />
                <span>{isEdit ? 'مراجعة وتأكيد التعديلات' : 'إضافة الصنف للقائمة'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Mandatory Diff / Confirmation Modal */}
      {pendingDiffs && (
        <DiffConfirmModal
          isOpen={true}
          title={isEdit ? `تأكيد تعديلات: ${item?.name_ar}` : `تأكيد إضافة صنف جديد: ${nameAr}`}
          description={
            isEdit
              ? 'راجع التغييرات أدناه قبل الحفظ. ستظهر التعديلات للعملاء فوراً.'
              : 'راجع بيانات الصنف الجديد أدناه قبل الإضافة إلى القائمة.'
          }
          changes={pendingDiffs}
          isSubmitting={isSubmitting}
          onConfirm={handlePersist}
          onCancel={() => setPendingDiffs(null)}
        />
      )}
    </>
  )
}
