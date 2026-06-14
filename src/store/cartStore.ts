import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id?: string;
  productId?: string;
  bundleId?: string;
  qty: number;
  options?: any;
  box?: boolean;
  mode?: string;
  contents?: any[];
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQty: (index: number, qty: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
}

const keyOf = (it: CartItem) => it.box
  ? "box|" + it.mode + "|" + JSON.stringify(it.contents) + "|" + JSON.stringify(it.options || {})
  : it.productId + "|" + it.bundleId + "|" + JSON.stringify(it.options || {});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (item) => {
        set((state) => {
          const k = keyOf(item);
          const idx = state.cart.findIndex((x) => keyOf(x) === k);
          if (idx >= 0) {
            const newCart = [...state.cart];
            newCart[idx] = { ...newCart[idx], qty: newCart[idx].qty + item.qty };
            return { cart: newCart };
          }
          return { cart: [...state.cart, item] };
        });
      },
      updateQty: (index, qty) => {
        set((state) => {
          const newCart = [...state.cart];
          newCart[index] = { ...newCart[index], qty: Math.max(1, qty) };
          return { cart: newCart };
        });
      },
      removeItem: (index) => {
        set((state) => ({
          cart: state.cart.filter((_, i) => i !== index)
        }));
      },
      clearCart: () => set({ cart: [] }),
      getCartCount: () => get().cart.reduce((sum, item) => sum + item.qty, 0)
    }),
    {
      name: 'joyjar-cart',
    }
  )
)
