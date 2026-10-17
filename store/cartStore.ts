'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { CartItem, ItemSize, SelectedAddon } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
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

  // Computed helpers (use as selectors)
  totalItems: () => number
  totalAmount: () => number
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
      isCheckoutOpen: false,

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
            return {
              items: state.items.map((i) =>
                i.cartId === existing.cartId
                  ? {
                      ...i,
                      quantity: i.quantity + 1,
                      lineTotal: computeLineTotal(i.unitPrice, i.addons, i.quantity + 1),
                    }
                  : i
              ),
            }
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
          return { items: [...state.items, newItem] }
        })
      },

      removeItem: (cartId) =>
        set((state) => ({
          items: state.items.filter((i) => i.cartId !== cartId),
        })),

      updateQuantity: (cartId, quantity) => {
        if (quantity < 1) {
          get().removeItem(cartId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.cartId === cartId
              ? {
                  ...i,
                  quantity,
                  lineTotal: computeLineTotal(i.unitPrice, i.addons, quantity),
                }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      openCheckout: () => set({ isCheckoutOpen: true, isOpen: false }),
      closeCheckout: () => set({ isCheckoutOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: () => get().items.reduce((sum, i) => sum + i.lineTotal, 0),
    }),
    {
      name: 'ninja-burger-cart',
      // Only persist the items array, not the modal states
      partialize: (state) => ({ items: state.items }),
    }
  )
)
