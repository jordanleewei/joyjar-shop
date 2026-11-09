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
  prune: (productIds: string[], bundleIds: string[]) => void;
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
      getCartCount: () => get().cart.reduce((sum, item) => sum + item.qty, 0),
      // Drop items for flavours/bundles that no longer exist and reset retired options.
      prune: (productIds, bundleIds) => {
        const pids = new Set(productIds), bids = new Set(bundleIds);
        const okSweet = (v: any) => (v === "less" || v === "none" ? v : "less");
        const next = get().cart
          .filter((it) => it.bundleId && bids.has(it.bundleId))
          .filter((it) => it.box
            ? (it.contents || []).length > 0 && (it.contents || []).every((c: any) => pids.has(c.productId))
            : !!it.productId && pids.has(it.productId))
          .map((it) => ({ ...it, mode: it.box ? "mix" : it.mode, options: { sweet: okSweet(it.options?.sweet) } }));
        if (JSON.stringify(next) !== JSON.stringify(get().cart)) set({ cart: next });
      }
    }),
    {
      name: 'joyjar-cart',
    }
  )
)
