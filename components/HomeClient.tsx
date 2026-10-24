'use client'

import { useState, useEffect } from 'react'
import { CategoryTabs } from '@/components/menu/CategoryTabs'
import { MenuGrid } from '@/components/menu/MenuGrid'
import { AddonsShowcase } from '@/components/menu/AddonsShowcase'
import { useCartStore } from '@/store/cartStore'
import type { Category, MenuItem, Addon } from '@/types'

interface HomeClientProps {
  categories: Category[]
  initialCategoryId: string
  allItems: MenuItem[]
  addons: Addon[]
  isLoggedIn?: boolean
}

export default function HomeClient({
  categories,
  initialCategoryId,
  allItems,
  addons,
  isLoggedIn,
}: HomeClientProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId)

  useEffect(() => {
    if (isLoggedIn) {
      useCartStore.getState().loadSavedCart()
    }
  }, [isLoggedIn])

  const activeCategory = categories.find((c) => c.id === activeCategoryId)
  const isAddonCategory =
    activeCategory?.name_en?.toLowerCase().includes('add-on') ||
    activeCategory?.name_ar?.includes('الاضافات') ||
    activeCategory?.name_ar?.includes('إضافات')

  const filteredItems = activeCategoryId
    ? allItems.filter((item) => item.category_id === activeCategoryId)
    : allItems

  return (
    <>
      <CategoryTabs
        categories={categories}
        activeId={activeCategoryId}
        onSelect={setActiveCategoryId}
      />
      <div className="mt-6">
        {isAddonCategory && filteredItems.length === 0 ? (
          <AddonsShowcase addons={addons} />
        ) : (
          <MenuGrid items={filteredItems} addons={addons} isLoggedIn={isLoggedIn} />
        )}
      </div>
    </>
  )
}
