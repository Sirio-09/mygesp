import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  variantId: string
  productSlug: string
  productName: string
  size: string
  color?: string
  priceCents: number
  quantity: number
  image?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (newItem) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.variantId === newItem.variantId
          )
          if (existingIndex >= 0) {
            const updatedItems = [...state.items]
            updatedItems[existingIndex].quantity += newItem.quantity
            return { items: updatedItems }
          }
          return { items: [...state.items, newItem] }
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.variantId !== variantId)
              : state.items.map((item) =>
                  item.variantId === variantId ? { ...item, quantity } : item
                ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
)