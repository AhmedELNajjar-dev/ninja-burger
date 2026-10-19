'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { CartItem, ItemSize, SelectedAddon } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  isCartOpen: boolean
  isCheckoutOpen: boolean

  // Actions
  addItem: (params: {
    menuItemId: string
    name_ar: string
    name_en: string
    size: ItemSize
    unitPrice: number
    addons: SelectedAddon[]
  }) => void
  removeItem: (cartId: string) => void
  updateQuantity: (cartId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  openCheckout: () => void
  closeCheckout: () => void

  loadSavedCart: () => Promise<void>

  // Computed helpers (use as selectors)
  totalItems: () => number
  totalAmount: () => number
  getTotal: () => number
}

let syncTimeout: any = null
function syncCartToDb(items: CartItem[]) {
  if (typeof window === 'undefined') return
  clearTimeout(syncTimeout)
  syncTimeout = setTimeout(() => {
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    }).catch(() => {})
  }, 400)
}

function computeLineTotal(unitPrice: number, addons: SelectedAddon[], quantity: number) {
  const addonTotal = addons.reduce((sum, a) => sum + a.price, 0)
  return (unitPrice + addonTotal) * quantity
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isCartOpen: false,
      isCheckoutOpen: false,

      loadSavedCart: async () => {
        try {
          const res = await fetch('/api/cart')
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data.items) && data.items.length > 0) {
              set({ items: data.items })
            }
          }
        } catch {}
      },

      addItem: ({ menuItemId, name_ar, name_en, size, unitPrice, addons }) => {
        set((state) => {
          // Check if same item + same size + same addons exists
          const addonIds = addons.map((a) => a.id).sort().join(',')
          const existing = state.items.find(
            (i) =>
              i.menuItemId === menuItemId &&
              i.size === size &&
              i.addons.map((a) => a.id).sort().join(',') === addonIds
          )

          if (existing) {
            const updatedItems = state.items.map((i) =>
              i.cartId === existing.cartId
                ? {
                    ...i,
                    quantity: i.quantity + 1,
                    lineTotal: computeLineTotal(i.unitPrice, i.addons, i.quantity + 1),
                  }
                : i
            )
            syncCartToDb(updatedItems)
            return { items: updatedItems }
          }

          const newItem: CartItem = {
            cartId: uuidv4(),
            menuItemId,
            name_ar,
            name_en,
            size,
            quantity: 1,
            unitPrice,
            addons,
            addonTotal: addons.reduce((s, a) => s + a.price, 0),
            lineTotal: computeLineTotal(unitPrice, addons, 1),
          }
          const newItems = [...state.items, newItem]
          syncCartToDb(newItems)
          return { items: newItems }
        })
      },

      removeItem: (cartId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.cartId !== cartId)
          syncCartToDb(newItems)
          return { items: newItems }
        })
      },

      updateQuantity: (cartId, quantity) => {
        if (quantity < 1) {
          get().removeItem(cartId)
          return
        }
        set((state) => {
          const newItems = state.items.map((i) =>
            i.cartId === cartId
              ? {
                  ...i,
                  quantity,
                  lineTotal: computeLineTotal(i.unitPrice, i.addons, quantity),
                }
              : i
          )
          syncCartToDb(newItems)
          return { items: newItems }
        })
      },

      clearCart: () => {
        set({ items: [] })
        syncCartToDb([])
      },

      openCart: () => set({ isOpen: true, isCartOpen: true }),
      closeCart: () => set({ isOpen: false, isCartOpen: false }),
      openCheckout: () => set({ isCheckoutOpen: true, isOpen: false, isCartOpen: false }),
      closeCheckout: () => set({ isCheckoutOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: () => get().items.reduce((sum, i) => sum + i.lineTotal, 0),
      getTotal: () => get().items.reduce((sum, i) => sum + i.lineTotal, 0),
    }),
    {
      name: 'ninja-burger-cart',
      // Only persist the items array, not the modal states
      partialize: (state) => ({ items: state.items }),
    }
  )
)
