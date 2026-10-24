'use client'

import { useState, useEffect } from 'react'
import { CategoryTabs } from '@/components/menu/CategoryTabs'
import { MenuGrid } from '@/components/menu/MenuGrid'
import { AddonsShowcase } from '@/components/menu/AddonsShowcase'
import { useCartStore } from '@/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import type { Category, MenuItem, Addon } from '@/types'

interface HomeClientProps {
  categories: Category[]
  initialCategoryId: string
  allItems: MenuItem[]
  addons: Addon[]
  isLoggedIn?: boolean
}

export default function HomeClient({
  categories: initialCategories,
  initialCategoryId,
  allItems: initialItems,
  addons: initialAddons,
  isLoggedIn,
}: HomeClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [addons, setAddons] = useState<Addon[]>(initialAddons)
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId)

  // Sync props if SSR re-renders
  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  useEffect(() => {
    setAddons(initialAddons)
  }, [initialAddons])

  useEffect(() => {
    if (isLoggedIn) {
      useCartStore.getState().loadSavedCart()
    }
  }, [isLoggedIn])

  // ── Supabase Realtime live sync for customer menu ──────────────────────────
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('customer-menu-realtime')
      // Menu Items live changes (availability toggle, price edit, add, delete)
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
      // Addons live changes (availability toggle, price edit)
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
      // Categories live changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCat = payload.new as Category
            setCategories((prev) => {
              if (prev.some((c) => c.id === newCat.id)) return prev
              return [...prev, newCat].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            })
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Category
            setCategories((prev) =>
              prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
            )
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            setCategories((prev) => prev.filter((c) => c.id !== deleted.id))
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn('[Realtime Error]', err)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const activeCategory = categories.find((c) => c.id === activeCategoryId)
  const isAddonCategory =
    activeCategory?.name_en?.toLowerCase().includes('add-on') ||
    activeCategory?.name_ar?.includes('الاضافات') ||
    activeCategory?.name_ar?.includes('إضافات')

  const filteredItems = activeCategoryId
    ? items.filter((item) => item.category_id === activeCategoryId)
    : items

  return (
    <>
      <CategoryTabs
        categories={categories}
        activeId={activeCategoryId}
        onSelect={setActiveCategoryId}
      />
      <div className="mt-6">
        {isAddonCategory && filteredItems.length === 0 ? (
          <AddonsShowcase addons={addons} isLoggedIn={isLoggedIn} />
        ) : (
          <MenuGrid items={filteredItems} addons={addons} isLoggedIn={isLoggedIn} />
        )}
      </div>
    </>
  )
}
