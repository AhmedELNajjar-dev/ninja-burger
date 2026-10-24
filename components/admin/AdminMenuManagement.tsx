'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react'
import { MenuItem, Category } from '@/types'
import { MenuItemFormModal } from './MenuItemFormModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { DiffConfirmModal, ChangeDiff } from './DiffConfirmModal'

interface AdminMenuManagementProps {
  initialItems: MenuItem[]
  categories: Category[]
}

export function AdminMenuManagement({
  initialItems,
  categories,
}: AdminMenuManagementProps) {
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Availability toggle diff modal state
  const [toggleDiffItem, setToggleDiffItem] = useState<{
    item: MenuItem
    newAvailable: boolean
    diffs: ChangeDiff[]
  } | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  // Filter items
  const filtered = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category_id === selectedCategory
    const query = searchQuery.toLowerCase().trim()
    const matchesQuery =
      !query ||
      item.name_ar.toLowerCase().includes(query) ||
      item.name_en.toLowerCase().includes(query) ||
      (item.description_ar && item.description_ar.toLowerCase().includes(query)) ||
      (item.description_en && item.description_en.toLowerCase().includes(query))

    return matchesCategory && matchesQuery
  })

  // Open Edit Modal
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormModalOpen(true)
  }

  // Open Create Modal
  const handleCreate = () => {
    setEditingItem(null)
    setFormModalOpen(true)
  }

  // Handle Item Saved (Create or Update)
  const handleItemSaved = (savedItem: MenuItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === savedItem.id)
      if (exists) {
        return prev.map((i) => (i.id === savedItem.id ? savedItem : i))
      }
      return [savedItem, ...prev]
    })
  }

  // Prepare Availability Toggle with mandatory Diff confirmation
  const handlePromptToggleAvailability = (item: MenuItem) => {
    const newAvailable = !item.is_available
    const diffs: ChangeDiff[] = [
      {
        field: 'حالة توفر الصنف للعملاء',
        oldVal: item.is_available ? 'متوفر للطلب' : 'غير متوفر (Out of stock)',
        newVal: newAvailable ? 'متوفر للطلب' : 'غير متوفر (Out of stock)',
      },
    ]
    setToggleDiffItem({ item, newAvailable, diffs })
  }

  // Execute Availability Toggle
  const handleConfirmToggle = async () => {
    if (!toggleDiffItem) return
    setIsToggling(true)

    try {
      const res = await fetch(`/api/admin/menu/${toggleDiffItem.item.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: toggleDiffItem.newAvailable }),
      })

      if (res.ok) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === toggleDiffItem.item.id
              ? { ...i, is_available: toggleDiffItem.newAvailable }
              : i
          )
        )
      } else {
        alert('تعذر تحديث حالة الصنف')
      }
    } catch {
      alert('حدث خطأ أثناء تعديل حالة الصنف')
    } finally {
      setIsToggling(false)
      setToggleDiffItem(null)
    }
  }

  // Execute Item Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/admin/menu/${itemToDelete.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id))
        setItemToDelete(null)
      } else {
        alert('فشل حذف الصنف من القائمة')
      }
    } catch {
      alert('حدث خطأ في الاتصال أثناء حذف الصنف')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top action bar: Search, Category Filter, and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-150 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-2.5">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو المكونات..."
              className="input-field pe-9 py-2 text-xs"
            />
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Category Filter */}
          <div className="relative w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field py-2 text-xs bg-white font-bold"
            >
              <option value="all">جميع الأقسام ({items.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ar} ({items.filter((i) => i.category_id === c.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add item button */}
        <button
          type="button"
          onClick={handleCreate}
          className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center justify-center gap-2 shadow-ninja shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          <span>إضافة صنف جديد</span>
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const categoryName =
            categories.find((c) => c.id === item.category_id)?.name_ar || 'قسم عام'

          return (
            <motion.div
              key={item.id}
              layout
              className={`bg-white rounded-3xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                item.is_available
                  ? 'border-gray-200 hover:shadow-md'
                  : 'border-red-200 bg-red-50/20 opacity-75'
              }`}
            >
              <div>
                {/* Image and badges */}
                <div className="h-40 w-full rounded-2xl bg-gray-100 overflow-hidden relative mb-3.5 border border-gray-150">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name_ar}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl select-none">
                      🍔
                    </div>
                  )}

                  {/* Availability badge */}
                  <div className="absolute top-2.5 end-2.5">
                    <button
                      type="button"
                      onClick={() => handlePromptToggleAvailability(item)}
                      title="انقر لتعديل حالة التوفر"
                      className={`px-3 py-1 rounded-full text-[11px] font-black border shadow-sm flex items-center gap-1.5 cursor-pointer transition-all ${
                        item.is_available
                          ? 'bg-green-600 text-white border-green-500 hover:bg-green-700'
                          : 'bg-red-600 text-white border-red-500 hover:bg-red-700'
                      }`}
                    >
                      {item.is_available ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>متوفر للطلب</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={13} />
                          <span>غير متوفر</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-2.5 start-2.5 bg-ninja-dark/85 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                    {categoryName}
                  </div>
                </div>

                {/* Names & Description */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-base text-ninja-dark leading-tight">
                      {item.name_ar}
                    </h4>
                    <span className="text-xs text-gray-400 font-semibold" dir="ltr">
                      {item.name_en}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description_ar || item.description_en}
                  </p>
                </div>

                {/* Prices tier */}
                <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-bold">
                      سنجل: {item.price_single} ج
                    </span>
                    {item.price_double && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-bold">
                        دابل: {item.price_double} ج
                      </span>
                    )}
                    {item.price_triple && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-bold">
                        تريبل: {item.price_triple} ج
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-gray-150 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handlePromptToggleAvailability(item)}
                  className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {item.is_available ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{item.is_available ? 'إيقاف التوفر' : 'تفعيل التوفر'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 size={14} />
                  <span>تعديل</span>
                </button>

                <button
                  type="button"
                  onClick={() => setItemToDelete(item)}
                  className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
                  title="حذف الصنف"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-150 p-6">
            <span className="text-5xl block mb-2">🔍</span>
            <h4 className="font-bold text-gray-800 text-base">لا توجد أصناف مطابقة للبحث</h4>
            <p className="text-xs text-gray-400 mt-1">جرب تغيير كلمات البحث أو اختيار قسم آخر</p>
          </div>
        )}
      </div>

      {/* Item Form Modal (Create / Edit) */}
      {formModalOpen && (
        <MenuItemFormModal
          isOpen={formModalOpen}
          item={editingItem}
          categories={categories}
          onClose={() => {
            setFormModalOpen(false)
            setEditingItem(null)
          }}
          onSaved={handleItemSaved}
        />
      )}

      {/* Mandatory Delete Confirmation Modal */}
      {itemToDelete && (
        <DeleteConfirmModal
          isOpen={true}
          title={`حذف الصنف: ${itemToDelete.name_ar}`}
          warningMessage="سيتم حذف هذا الصنف نهائياً من قاعدة بيانات القائمة ولن يتمكن العملاء من رؤيته أو طلبه مجدداً."
          details={[
            { label: 'الاسم بالعربية', value: itemToDelete.name_ar },
            { label: 'الاسم بالإنجليزية', value: itemToDelete.name_en },
            {
              label: 'القسم',
              value: categories.find((c) => c.id === itemToDelete.category_id)?.name_ar || '-',
            },
            {
              label: 'الأسعار',
              value: `سنجل: ${itemToDelete.price_single} ج | دابل: ${itemToDelete.price_double ?? '-'} ج | تريبل: ${itemToDelete.price_triple ?? '-'} ج`,
            },
            {
              label: 'الحالة الحالية',
              value: itemToDelete.is_available ? 'متوفر' : 'غير متوفر',
            },
          ]}
          isSubmitting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}

      {/* Mandatory Availability Toggle Diff Modal */}
      {toggleDiffItem && (
        <DiffConfirmModal
          isOpen={true}
          title={`تعديل حالة توفر: ${toggleDiffItem.item.name_ar}`}
          description="تأكيد التغيير على ظهور وتوفر الصنف للعملاء على الموقع:"
          changes={toggleDiffItem.diffs}
          isSubmitting={isToggling}
          onConfirm={handleConfirmToggle}
          onCancel={() => setToggleDiffItem(null)}
        />
      )}
    </div>
  )
}
