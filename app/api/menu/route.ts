import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import {
  DEFAULT_CATEGORIES,
  DEFAULT_MENU_ITEMS,
  DEFAULT_ADDONS,
  DEFAULT_SAUCE_OPTIONS,
  DEFAULT_DRINK_OPTIONS,
  isSandwichTopping,
} from '@/lib/constants/menuData'
import type { Category, MenuItem, Addon } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const adminClient = createAdminClient()

    const [{ data: categories }, { data: items }, { data: addons }] = await Promise.all([
      adminClient.from('categories').select('*').order('sort_order', { ascending: true }),
      adminClient.from('menu_items').select('*, category:categories(id, name_ar, name_en, sort_order)').order('sort_order', { ascending: true }),
      adminClient.from('addons').select('*').order('sort_order', { ascending: true }),
    ])

    const safeCategories: Category[] =
      categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES
    const safeItems: MenuItem[] =
      items && items.length > 0 ? items : DEFAULT_MENU_ITEMS
    const rawAddons: Addon[] =
      addons && addons.length > 0 ? addons : DEFAULT_ADDONS

    const safeAddons: Addon[] = rawAddons.map((addon) => {
      let options = addon.options
      const lowerEn = (addon.name_en || '').toLowerCase()
      const nameAr = addon.name_ar || ''

      if (!options || options.length === 0) {
        if (addon.id === 'addon-8' || lowerEn.includes('sauce') || nameAr.includes('صوص')) {
          options = DEFAULT_SAUCE_OPTIONS
        } else if (addon.id === 'addon-10' || lowerEn.includes('drink') || lowerEn.includes('sparkling') || nameAr.includes('غازية')) {
          options = DEFAULT_DRINK_OPTIONS
        }
      }

      const is_topping =
        addon.is_topping !== undefined ? addon.is_topping : isSandwichTopping(addon)

      return {
        ...addon,
        options: options || [],
        is_topping,
      }
    })

    const response = NextResponse.json({
      categories: safeCategories,
      items: safeItems,
      addons: safeAddons,
    })

    // Prevent any browser or intermediary caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    return response
  } catch (error) {
    console.error('[API /api/menu Error]', error)
    return NextResponse.json({
      categories: DEFAULT_CATEGORIES,
      items: DEFAULT_MENU_ITEMS,
      addons: DEFAULT_ADDONS,
    })
  }
}
