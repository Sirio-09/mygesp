"use client";
import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import Link from "next/link";

export default function SuccessoPage() {
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <main className="max-w-[600px] mx-auto px-4 sm:px-8 py-24 text-center">
      <h1 className="text-ink font-extrabold text-2xl sm:text-3xl mb-4">
        Ordine confermato
      </h1>
      <p className="text-ink-soft mb-8">
        Grazie per il tuo acquisto. Riceverai una email di conferma a breve.
      </p>
      <Link href="/" className="text-grass-deep hover:underline">
        Torna allo shop →
      </Link>
    </main>
  );
}