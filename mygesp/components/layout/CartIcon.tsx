"use client";

import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";

export default function CartIcon() {
  const totalItems = useCartStore((state) => state.totalItems());
  const openCart = useCartStore((state) => state.openCart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={openCart}
      type="button"
      className="relative text-ink text-lg p-1 hover:text-grass-deep transition-colors"
      aria-label="Apri carrello"
    >
      🛒
      {mounted && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-grass-deep text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full font-mono">
          {totalItems}
        </span>
      )}
    </button>
  );
}