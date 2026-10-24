import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { DEFAULT_CATEGORIES, DEFAULT_MENU_ITEMS, DEFAULT_ADDONS } from '@/lib/constants/menuData'
import type { Category, MenuItem, Addon } from '@/types'

/**
 * Cached fetch for menu categories, items, and addons.
 * Revalidates in the background every 300 seconds (5 minutes),
 * providing near-instantaneous (sub-50ms) page responses.
 */
export const getCachedMenuData = unstable_cache(
  async (): Promise<{
    categories: Category[]
    menuItems: MenuItem[]
    addons: Addon[]
  }> => {
    try {
      const adminClient = createAdminClient()

      const [
        { data: categories },
        { data: menuItems },
        { data: addons },
      ] = await Promise.all([
        adminClient
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true }),
        adminClient
          .from('menu_items')
          .select('*, category:categories(id, name_ar, name_en, sort_order)')
          .order('sort_order', { ascending: true }),
        adminClient
          .from('addons')
          .select('*')
          .order('sort_order', { ascending: true }),
      ])

      const safeCategories: Category[] =
        categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES
      const safeItems: MenuItem[] =
        menuItems && menuItems.length > 0 ? menuItems : DEFAULT_MENU_ITEMS
      const safeAddons: Addon[] =
        addons && addons.length > 0 ? addons : DEFAULT_ADDONS

      return {
        categories: safeCategories,
        menuItems: safeItems,
        addons: safeAddons,
      }
    } catch (error) {
      console.warn('[Cache] Failed to load fresh menu data, using defaults:', error)
      return {
        categories: DEFAULT_CATEGORIES,
        menuItems: DEFAULT_MENU_ITEMS,
        addons: DEFAULT_ADDONS,
      }
    }
  },
  ['ninja-menu-catalog'],
  {
    revalidate: 300, // 5 minutes
    tags: ['menu-catalog'],
  }
)
