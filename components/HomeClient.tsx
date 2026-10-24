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

  // ── Unified Instant Realtime Live Sync (Broadcast + Postgres Changes + Background Sync) ──
  useEffect(() => {
    const supabase = createClient()

    // Function to fetch fresh menu data from no-store endpoint
    const fetchFreshMenu = async () => {
      try {
        const res = await fetch('/api/menu', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.items) && data.items.length > 0) setItems(data.items)
          if (Array.isArray(data.addons) && data.addons.length > 0) setAddons(data.addons)
          if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories)
        }
      } catch {}
    }

    const channel = supabase
      .channel('customer-menu-realtime', {
        config: { broadcast: { self: false } },
      })
      // 1. Instant WebSocket Broadcast from Admin (< 20ms)
      .on('broadcast', { event: 'item_updated' }, ({ payload }) => {
        setItems((prev) =>
          prev.map((i) => (i.id === payload.id ? { ...i, ...payload } : i))
        )
      })
      .on('broadcast', { event: 'item_saved' }, ({ payload }) => {
        setItems((prev) => {
          const exists = prev.some((i) => i.id === payload.id)
          if (exists) {
            return prev.map((i) => (i.id === payload.id ? { ...i, ...payload } : i))
          }
          return [...prev, payload].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        })
      })
      .on('broadcast', { event: 'item_deleted' }, ({ payload }) => {
        setItems((prev) => prev.filter((i) => i.id !== payload.id))
      })
      .on('broadcast', { event: 'addon_updated' }, ({ payload }) => {
        setAddons((prev) =>
          prev.map((a) => (a.id === payload.id ? { ...a, ...payload } : a))
        )
      })
      // 2. Direct Postgres Changes (for DB Studio edits)
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
      .subscribe()

    // 3. Auto-sync on window focus & tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchFreshMenu()
      }
    }
    window.addEventListener('focus', fetchFreshMenu)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 4. Background polling safeguard every 15 seconds
    const intervalId = setInterval(fetchFreshMenu, 15000)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('focus', fetchFreshMenu)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(intervalId)
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
