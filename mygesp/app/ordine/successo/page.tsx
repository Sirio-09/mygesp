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
    <main className="max-w-[600px] mx-auto px-8 py-24 text-center">
      <h1 className="font-display text-3xl uppercase text-loden-deep mb-4">
        Ordine confermato
      </h1>
      <p className="text-slate mb-8">
        Grazie per il tuo acquisto. Riceverai una email di conferma a breve.
      </p>
      <Link href="/" className="text-rust hover:underline">
        Torna allo shop →
      </Link>
    </main>
  );
}