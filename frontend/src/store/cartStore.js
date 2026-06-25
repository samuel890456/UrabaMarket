import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set) => ({
      count: 0,
      items: [],
      setCart: (cart) => {
        const items = cart?.items ?? [];
        const count = items.reduce((sum, item) => sum + Number(item.cantidad ?? 0), 0);
        set({ items, count });
      },
      setCount: (count) => set({ count }),
      resetCart: () => set({ items: [], count: 0 })
    }),
    {
      name: "urabamarket-cart",
      partialize: (state) => ({ count: state.count, items: state.items })
    }
  )
);
