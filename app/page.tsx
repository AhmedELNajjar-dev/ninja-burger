import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CheckoutModal } from '@/components/cart/CheckoutModal'
import { Footer } from '@/components/Footer'
import HomeHero from '@/components/HomeHero'
import { getCachedMenuData } from '@/lib/menuCache'
import type { Category, MenuItem, Addon, Profile } from '@/types'

export const revalidate = 60 // ISR: revalidate menu every 60 seconds

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const supabase = createClient()

  // Fetch cached menu data and user session concurrently
  const [
    { categories: safeCategories, menuItems: safeItems, addons: safeAddons },
    { data: { user } },
  ] = await Promise.all([
    getCachedMenuData(),
    supabase.auth.getUser(),
  ])

  // Fetch profile if user is logged in
  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Determine active category
  const activeCategoryId =
    searchParams.category ??
    safeCategories[0]?.id ??
    ''

  return (
    <div className="min-h-screen bg-ninja-gray">
      <Navbar profile={profile} />

      {/* Hero Section */}
      <HomeHero />

      {/* Menu Section */}
      <section
        id="menu"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-extrabold text-ninja-dark">
            🍔 قائمة الطعام
          </h2>
          <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-ninja-red/30 to-transparent" />
        </div>

        {/* Category Tabs — client component for interactivity */}
        <CategoryTabsWrapper
          categories={safeCategories}
          activeCategoryId={activeCategoryId}
          allItems={safeItems}
          addons={safeAddons}
          isLoggedIn={!!user}
        />
      </section>

      {/* Cart Drawer (client) */}
      <CartDrawer />

      {/* Checkout Modal (client) */}
      <CheckoutModal
        userName={profile?.full_name}
        userPhone={profile?.phone}
      />

      {/* Responsive Cross-Platform Footer */}
      <Footer />
    </div>
  )
}

// ─── Inline client wrapper to handle category tab state ─────────────────────
// This is a thin server→client bridge. The actual tab UI is in CategoryTabs.tsx
import HomeClient from '@/components/HomeClient'

function CategoryTabsWrapper({
  categories,
  activeCategoryId,
  allItems,
  addons,
  isLoggedIn,
}: {
  categories: Category[]
  activeCategoryId: string
  allItems: MenuItem[]
  addons: Addon[]
  isLoggedIn: boolean
}) {
  return (
    <HomeClient
      categories={categories}
      initialCategoryId={activeCategoryId}
      allItems={allItems}
      addons={addons}
      isLoggedIn={isLoggedIn}
    />
  )
}
