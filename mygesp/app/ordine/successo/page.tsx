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
    <main className="min-h-[80vh] flex items-center justify-center bg-paper-warm/20 px-4 py-12">
      <div className="w-full max-w-lg bg-white border border-line rounded-2xl p-10 text-center shadow-sm">
        <div className="w-20 h-20 bg-grass/10 text-grass-deep rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-tight text-ink mb-3">
          Ordine Confermato
        </h1>
        
        <p className="text-sm text-ink-soft leading-relaxed mb-8 max-w-[300px] mx-auto">
          Grazie per il tuo acquisto! Abbiamo ricevuto il tuo ordine e a breve riceverai un'email con tutti i dettagli e il riepilogo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/account/ordini" 
            className="bg-paper-warm hover:bg-line/50 text-ink font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-md transition-colors"
          >
            I miei ordini
          </Link>
          <Link 
            href="/shop" 
            className="bg-grass hover:bg-grass-deep text-white font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-md transition-colors shadow-md"
          >
            Torna allo Shop
          </Link>
        </div>
      </div>
    </main>
  );
}