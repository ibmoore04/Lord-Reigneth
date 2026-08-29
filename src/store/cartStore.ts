// ============================================================
// Cart Store — Zustand + localStorage persistence.
// Cart state lives client-side only. Prices displayed in the
// cart come from the database when items are added, but the
// actual ORDER TOTAL is always recalculated server-side.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/database';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Mutations
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (incoming) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.menu_item_id === incoming.menu_item_id,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menu_item_id === incoming.menu_item_id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...incoming, quantity: 1 }] };
        });
      },

      removeItem: (menuItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.menu_item_id !== menuItemId),
        }));
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.menu_item_id === menuItemId ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      // Client-side subtotal estimate only — server always recalculates.
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'lrf-cart',
      // Only persist items — not UI state like isOpen
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
