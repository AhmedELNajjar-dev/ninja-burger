'use client'

import { useState } from 'react'
import { CategoryTabs } from '@/components/menu/CategoryTabs'
import { MenuGrid } from '@/components/menu/MenuGrid'
import type { Category, MenuItem, Addon } from '@/types'

interface HomeClientProps {
  categories: Category[]
  initialCategoryId: string
  allItems: MenuItem[]
  addons: Addon[]
}

export default function HomeClient({
  categories,
  initialCategoryId,
  allItems,
  addons,
}: HomeClientProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId)

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
        <MenuGrid items={filteredItems} addons={addons} />
      </div>
    </>
  )
}
