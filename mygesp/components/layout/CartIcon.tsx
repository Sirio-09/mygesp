"use client";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";

export default function CartIcon() {
  const totalItems = useCartStore((state) => state.totalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link href="/carrello" className="relative text-canvas text-lg">
      ⛃
      {mounted && totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-rust text-white text-[10px] font-mono w-4 h-4 flex items-center justify-center rounded-full">
          {totalItems}
        </span>
      )}
    </Link>
  );
}