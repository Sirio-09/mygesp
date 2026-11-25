import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  productSlug: string;
  productName: string;
  size: string;
  priceCents: number;
  quantity: number;
  image?: string | null;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  /** Riallinea i prezzi salvati nel carrello con quelli autorevoli del server. */
  applyPrices: (prices: { variantId: string; priceCents: number }[]) => void;
  clear: () => void;
  totalCents: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [...get().items, item],
            isOpen: true,
          });
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        });
      },

      applyPrices: (prices) => {
        if (!Array.isArray(prices) || prices.length === 0) return;

        const byVariant = new Map(
          prices
            .filter(
              (entry) =>
                typeof entry?.variantId === "string" &&
                Number.isFinite(entry?.priceCents)
            )
            .map((entry) => [entry.variantId, entry.priceCents] as const)
        );

        if (byVariant.size === 0) return;

        set({
          items: get().items.map((item) => {
            const price = byVariant.get(item.variantId);

            return price === undefined || price === item.priceCents
              ? item
              : { ...item, priceCents: price };
          }),
        });
      },

      clear: () => set({ items: [] }),

      totalCents: () =>
        get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "mygesp-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);