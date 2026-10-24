'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  Sparkles,
  UtensilsCrossed,
  DollarSign,
  Settings2,
} from 'lucide-react'
import { MenuItem, Category, Addon } from '@/types'
import { MenuItemFormModal } from './MenuItemFormModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { DiffConfirmModal, ChangeDiff } from './DiffConfirmModal'
import { EditAddonModal } from './EditAddonModal'

interface AdminMenuManagementProps {
  initialItems: MenuItem[]
  categories: Category[]
  initialAddons?: Addon[]
}

const ADDON_EMOJIS: Record<string, string> = {
  'إضافة بيكون': '🥓',
  'Bacon Add-on': '🥓',
  'إضافة موتزاريلا': '🧀',
  'Mozzarella Add-on': '🧀',
  'إضافة مشروم': '🍄',
  'Mushroom Add-on': '🍄',
  'إضافة تركي': '🍗',
  'Turkey Add-on': '🍗',
  'إضافة بيبروني': '🍕',
  'Pepperoni Add-on': '🍕',
  'شريحة جبن': '🧀',
  'Cheese Slice': '🧀',
  'باكيت فرايز': '🍟',
  'Fries Packet': '🍟',
  'كاب صوص': '🥫',
  'Sauce Cup': '🥫',
  'مياه معدنية': '💧',
  'Mineral Water': '💧',
  'مياه غازية': '🥤',
  'Sparkling Water': '🥤',
  'كرمليز أوبيون': '🧅',
  'Caramelized Onion': '🧅',
  'إضافة هاليبنو': '🌶️',
  'Jalapeño Add-on': '🌶️',
}

export function AdminMenuManagement({
  initialItems,
  categories,
  initialAddons = [],
}: AdminMenuManagementProps) {
  // Navigation sub-tab: 'items' or 'addons'
  const [subTab, setSubTab] = useState<'items' | 'addons'>('items')

  // Menu items state
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Add-ons state
  const [addons, setAddons] = useState<Addon[]>(initialAddons)
  const [addonSearchQuery, setAddonSearchQuery] = useState('')

  // Modals state for Menu Items
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toggleDiffItem, setToggleDiffItem] = useState<{
    item: MenuItem
    newAvailable: boolean
    diffs: ChangeDiff[]
  } | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  // Modals state for Add-ons
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null)
  const [toggleDiffAddon, setToggleDiffAddon] = useState<{
    addon: Addon
    newAvailable: boolean
    diffs: ChangeDiff[]
  } | null>(null)
  const [isTogglingAddon, setIsTogglingAddon] = useState(false)

  // ── Supabase Realtime Channel Reference for Instant Broadcasts ────────────
  const realtimeChannelRef = useRef<any>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('customer-menu-realtime', {
        config: { broadcast: { self: true } },
      })
    channel.subscribe()
    realtimeChannelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ── Supabase Realtime live sync across admin sessions ──────────────────────
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-menu-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as MenuItem
            setItems((prev) => {
              if (prev.some((i) => i.id === newItem.id)) return prev
              return [...prev, newItem].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            })
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as MenuItem
            setItems((prev) =>
              prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i))
            )
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            setItems((prev) => prev.filter((i) => i.id !== deleted.id))
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'addons' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAddon = payload.new as Addon
            setAddons((prev) => {
              if (prev.some((a) => a.id === newAddon.id)) return prev
              return [...prev, newAddon].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            })
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Addon
            setAddons((prev) =>
              prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
            )
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            setAddons((prev) => prev.filter((a) => a.id !== deleted.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])


  // ── Menu Items Filtering ───────────────────────────────────────────────────
  const filteredItems = items.filter((item) => {
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

  // ── Addons Filtering ───────────────────────────────────────────────────────
  const filteredAddons = addons.filter((addon) => {
    const query = addonSearchQuery.toLowerCase().trim()
    if (!query) return true
    return (
      addon.name_ar.toLowerCase().includes(query) ||
      addon.name_en.toLowerCase().includes(query)
    )
  })

  // ── Menu Items Actions ─────────────────────────────────────────────────────
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setFormModalOpen(true)
  }

  const handleCreateItem = () => {
    setEditingItem(null)
    setFormModalOpen(true)
  }

  const handleItemSaved = (savedItem: MenuItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === savedItem.id)
      if (exists) {
        return prev.map((i) => (i.id === savedItem.id ? savedItem : i))
      }
      return [savedItem, ...prev]
    })

    // Instant Realtime broadcast to customer menu
    try {
      realtimeChannelRef.current?.send({
        type: 'broadcast',
        event: 'item_saved',
        payload: savedItem,
      })
    } catch {}
  }

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

  const handleConfirmToggle = async () => {
    if (!toggleDiffItem) return
    const { item, newAvailable } = toggleDiffItem
    setIsToggling(true)

    try {
      const res = await fetch(`/api/admin/menu/${item.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newAvailable }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'تعذر تعديل حالة التوفر')
      }

      const updatedItem = { ...item, is_available: newAvailable }
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? updatedItem : i))
      )

      // Instant Realtime broadcast to customer menu
      try {
        realtimeChannelRef.current?.send({
          type: 'broadcast',
          event: 'item_updated',
          payload: updatedItem,
        })
      } catch {}

      setToggleDiffItem(null)
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تعديل حالة الصنف')
    } finally {
      setIsToggling(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/admin/menu/${itemToDelete.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'تعذر حذف الصنف')
      }

      const deletedId = itemToDelete.id
      setItems((prev) => prev.filter((i) => i.id !== deletedId))

      // Instant Realtime broadcast to customer menu
      try {
        realtimeChannelRef.current?.send({
          type: 'broadcast',
          event: 'item_deleted',
          payload: { id: deletedId },
        })
      } catch {}

      setItemToDelete(null)
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في الاتصال أثناء حذف الصنف')
    } finally {
      setIsDeleting(false)
    }
  }

  // ── Add-ons Actions ────────────────────────────────────────────────────────
  const handlePromptToggleAddonAvailability = (addon: Addon) => {
    const currentAvailable = addon.is_available !== false
    const newAvailable = !currentAvailable
    const diffs: ChangeDiff[] = [
      {
        field: 'حالة توفر الإضافة للعملاء',
        oldVal: currentAvailable ? 'متوفر للطلب' : 'غير متوفر (Out of stock)',
        newVal: newAvailable ? 'متوفر للطلب' : 'غير متوفر (Out of stock)',
      },
    ]
    setToggleDiffAddon({ addon, newAvailable, diffs })
  }

  const handleConfirmToggleAddon = async () => {
    if (!toggleDiffAddon) return
    const { addon, newAvailable } = toggleDiffAddon
    setIsTogglingAddon(true)

    try {
      const res = await fetch(`/api/admin/addons/${addon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newAvailable }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'تعذر تعديل حالة الإضافة')
      }

      const data = await res.json()
      const updated = data.addon || { ...addon, is_available: newAvailable }

      setAddons((prev) =>
        prev.map((a) => (a.id === addon.id ? updated : a))
      )

      // Instant Realtime broadcast to customer menu
      try {
        realtimeChannelRef.current?.send({
          type: 'broadcast',
          event: 'addon_updated',
          payload: updated,
        })
      } catch {}

      setToggleDiffAddon(null)
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تعديل حالة توفر الإضافة')
    } finally {
      setIsTogglingAddon(false)
    }
  }

  const handleAddonUpdated = (updatedAddon: Addon) => {
    setAddons((prev) =>
      prev.map((a) => (a.id === updatedAddon.id ? updatedAddon : a))
    )

    // Instant Realtime broadcast to customer menu
    try {
      realtimeChannelRef.current?.send({
        type: 'broadcast',
        event: 'addon_updated',
        payload: updatedAddon,
      })
    } catch {}

    setEditingAddon(null)
  }

  // Addon metrics
  const availableAddonsCount = addons.filter((a) => a.is_available !== false).length
  const unavailableAddonsCount = addons.length - availableAddonsCount

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── Sub Navigation Tabs (Menu Items vs Addons) ───────────────────── */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit border border-gray-200">
        <button
          type="button"
          onClick={() => setSubTab('items')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            subTab === 'items'
              ? 'bg-white text-ninja-dark shadow-sm'
              : 'text-gray-500 hover:text-ninja-dark'
          }`}
        >
          <UtensilsCrossed size={16} />
          <span>أصناف القائمة والوجبات</span>
          <span className="bg-ninja-red/10 text-ninja-red px-2 py-0.5 rounded-full text-[10px]">
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('addons')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            subTab === 'addons'
              ? 'bg-white text-ninja-dark shadow-sm'
              : 'text-gray-500 hover:text-ninja-dark'
          }`}
        >
          <Sparkles size={16} />
          <span>الإضافات والجبن والصوصات</span>
          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px]">
            {addons.length}
          </span>
        </button>
      </div>

      {/* ── View 1: Menu Items Management ─────────────────────────────────── */}
      {subTab === 'items' && (
        <div className="space-y-6">
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
              onClick={handleCreateItem}
              className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center justify-center gap-2 shadow-ninja shrink-0 cursor-pointer"
            >
              <Plus size={18} />
              <span>إضافة صنف جديد</span>
            </button>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
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
                        {item.price_double || item.price_triple ? (
                          <>
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
                          </>
                        ) : (
                          <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-lg font-black">
                            السعر: {item.price_single} ج
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
                      onClick={() => handleEditItem(item)}
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

            {filteredItems.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-150 p-6">
                <span className="text-5xl block mb-2">🔍</span>
                <h4 className="font-bold text-gray-800 text-base">لا توجد أصناف مطابقة للبحث</h4>
                <p className="text-xs text-gray-400 mt-1">جرب تغيير كلمات البحث أو اختيار قسم آخر</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── View 2: Add-ons Management ───────────────────────────────────── */}
      {subTab === 'addons' && (
        <div className="space-y-6">
          {/* Header & Stats Banner */}
          <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h3 className="text-lg font-black text-ninja-dark">
                  إدارة الإضافات، الجبن، والصوصات
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                تحكم في أسعار الإضافات وتوفرها للطلب. أي تعديل يتم تحديثه فورياً في سلة الشراء وقائمة الطعام للعميل.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-2xl text-center">
                <span className="text-[11px] text-gray-400 block font-bold">الإجمالي</span>
                <span className="text-base font-black text-gray-800">{addons.length}</span>
              </div>
              <div className="bg-green-50 border border-green-200 px-3.5 py-2 rounded-2xl text-center">
                <span className="text-[11px] text-green-700 block font-bold">المتاح للطلب</span>
                <span className="text-base font-black text-green-700">{availableAddonsCount}</span>
              </div>
              <div className="bg-red-50 border border-red-200 px-3.5 py-2 rounded-2xl text-center">
                <span className="text-[11px] text-red-700 block font-bold">غير متوفر</span>
                <span className="text-base font-black text-red-700">{unavailableAddonsCount}</span>
              </div>
            </div>
          </div>

          {/* Search bar for Addons */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={addonSearchQuery}
              onChange={(e) => setAddonSearchQuery(e.target.value)}
              placeholder="ابحث عن إضافة أو صوص..."
              className="input-field pe-9 py-2.5 text-xs bg-white"
            />
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Addons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAddons.map((addon) => {
              const emoji =
                ADDON_EMOJIS[addon.name_ar] ||
                ADDON_EMOJIS[addon.name_en] ||
                '✨'
              const isAvailable = addon.is_available !== false

              return (
                <motion.div
                  key={addon.id}
                  layout
                  className={`bg-white rounded-3xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                    isAvailable
                      ? 'border-gray-200 hover:shadow-md'
                      : 'border-red-200 bg-red-50/20 opacity-80'
                  }`}
                >
                  <div>
                    {/* Top row: Emoji & Availability badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-3xl select-none">{emoji}</span>
                      <button
                        type="button"
                        onClick={() => handlePromptToggleAddonAvailability(addon)}
                        title="انقر لتعديل حالة التوفر"
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border shadow-xs flex items-center gap-1 cursor-pointer transition-all ${
                          isAvailable
                            ? 'bg-green-600 text-white border-green-500 hover:bg-green-700'
                            : 'bg-red-600 text-white border-red-500 hover:bg-red-700'
                        }`}
                      >
                        {isAvailable ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>متوفر</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            <span>غير متوفر</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Titles */}
                    <h4 className="font-black text-sm text-ninja-dark leading-tight">
                      {addon.name_ar}
                    </h4>
                    <span className="text-[11px] text-gray-400 block font-medium mt-0.5" dir="ltr">
                      {addon.name_en}
                    </span>

                    {/* Price display */}
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-semibold">السعر الحالي:</span>
                      <span className="text-base font-black text-ninja-red">
                        {addon.price} ج
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-150 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePromptToggleAddonAvailability(addon)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                        isAvailable
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          : 'bg-green-50 hover:bg-green-100 text-green-700'
                      }`}
                    >
                      {isAvailable ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{isAvailable ? 'إيقاف التوفر' : 'إتاحة للطلب'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingAddon(addon)}
                      className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Edit2 size={13} />
                      <span>تعديل</span>
                    </button>
                  </div>
                </motion.div>
              )
            })}

            {filteredAddons.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-gray-150 p-6">
                <span className="text-4xl block mb-2">🔍</span>
                <h4 className="font-bold text-gray-800 text-sm">لا توجد إضافات مطابقة للبحث</h4>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modals for Menu Items ─────────────────────────────────────────── */}
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
              value: itemToDelete.price_double || itemToDelete.price_triple
                ? `سنجل: ${itemToDelete.price_single} ج | دابل: ${itemToDelete.price_double ?? '-'} ج | تريبل: ${itemToDelete.price_triple ?? '-'} ج`
                : `السعر: ${itemToDelete.price_single} ج (حجم موحد)`,
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

      {/* ── Modals for Add-ons ────────────────────────────────────────────── */}
      {editingAddon && (
        <EditAddonModal
          addon={editingAddon}
          isOpen={true}
          onClose={() => setEditingAddon(null)}
          onAddonUpdated={handleAddonUpdated}
        />
      )}

      {toggleDiffAddon && (
        <DiffConfirmModal
          isOpen={true}
          title={`تعديل توفر الإضافة: ${toggleDiffAddon.addon.name_ar}`}
          description="تأكيد التغيير على إمكانية اختيار وطلب هذه الإضافة من قِبل العملاء:"
          changes={toggleDiffAddon.diffs}
          isSubmitting={isTogglingAddon}
          onConfirm={handleConfirmToggleAddon}
          onCancel={() => setToggleDiffAddon(null)}
        />
      )}
    </div>
  )
}
