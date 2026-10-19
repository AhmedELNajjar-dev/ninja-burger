'use client'

import { useState, useEffect } from 'react'
import { CategoryTabs } from '@/components/menu/CategoryTabs'
import { MenuGrid } from '@/components/menu/MenuGrid'
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
        <MenuGrid items={filteredItems} addons={addons} isLoggedIn={isLoggedIn} />
      </div>
    </>
  )
}
