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
      className="relative text-ink flex items-center justify-center p-2 hover:text-grass-deep transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label="Apri carrello"
    >
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      
      {mounted && totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-grass-deep text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full font-mono ring-2 ring-white shadow-sm">
          {totalItems}
        </span>
      )}
    </button>
  );
}