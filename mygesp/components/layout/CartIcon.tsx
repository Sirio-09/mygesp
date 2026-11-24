"use client";

import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";

export default function CartIcon() {
  const totalItems = useCartStore((state) => state.totalItems());
  const isOpen = useCartStore((state) => state.isOpen);
  const openCart = useCartStore((state) => state.openCart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={openCart}
      type="button"
      className="relative flex items-center justify-center p-2 text-ink transition-colors duration-200 ease-out-expo hover:text-grass-deep"
      aria-label="Apri carrello"
      aria-controls="cart-drawer"
      aria-expanded={isOpen}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>

      {mounted && totalItems > 0 && (
        <span
          key={totalItems}
          className="absolute -right-0.5 -top-0.5 flex h-5 w-5 animate-scale-in items-center justify-center rounded-full bg-grass-deep text-[10px] font-semibold tabular-nums text-white ring-2 ring-paper"
        >
          {totalItems}
        </span>
      )}
    </button>
  );
}
