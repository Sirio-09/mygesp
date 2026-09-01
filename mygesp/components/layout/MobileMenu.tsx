"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";

type RecommendedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
};

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Evita problemi di idratazione Next.js / SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Blocco dello scroll della pagina a menu aperto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Caricamento dei prodotti consigliati
  useEffect(() => {
    if (open && recommended.length === 0) {
      setLoading(true);
      fetch("/api/prodotti?limit=2")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          const list = Array.isArray(data) ? data : data.products || [];
          setRecommended(list.slice(0, 2));
        })
        .catch(() => setRecommended([]))
        .finally(() => setLoading(false));
    }
  }, [open, recommended.length]);

  return (
    <div className="lg:hidden">
      {/* TASTO HAMBURGER ANIMATO */}
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col justify-center items-center w-8 h-8 gap-1.5 focus:outline-none relative z-30"
        aria-label="Apri Menu"
      >
        <span
          className={`w-6 h-0.5 bg-ink transition-all duration-300 ease-in-out ${
            open ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`w-6 h-0.5 bg-ink transition-all duration-300 ease-in-out ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`w-6 h-0.5 bg-ink transition-all duration-300 ease-in-out ${
            open ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      {/* RENDERIZZA IL DRAWER DIRETTAMENTE NEL BODY (PORTAL) */}
      {mounted &&
        createPortal(
          <>
            {/* SFONDO OSCURATO A TUTTO SCHERMO */}
            <div
              onClick={() => setOpen(false)}
              className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] transition-opacity duration-300 ease-in-out ${
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            />

            {/* DRAWER LATERALE SU TUTTA L'ALTEZZA (100vh) */}
            <aside
              className={`fixed top-0 left-0 bottom-0 h-screen w-[85%] max-w-xs bg-paper z-[999] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* Intestazione */}
              <div className="flex items-center justify-between p-5 border-b border-line bg-paper-warm shrink-0">
                <span className="font-extrabold text-ink text-sm tracking-widest uppercase">
                  Menu
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-ink-soft hover:text-ink text-lg font-bold p-1"
                  aria-label="Chiudi menu"
                >
                  ✕
                </button>
              </div>

              {/* Categorie e Navigazione */}
              <div className="flex-1 overflow-y-auto p-5">
                <nav className="flex flex-col space-y-1">
                  <Link
                    href="/categoria/abbigliamento"
                    onClick={() => setOpen(false)}
                    className="px-3 py-3 text-ink font-semibold text-sm hover:text-grass-deep border-b border-line/50 transition-colors uppercase tracking-wide"
                  >
                    Abbigliamento
                  </Link>
                  <Link
                    href="/categoria/stivali"
                    onClick={() => setOpen(false)}
                    className="px-3 py-3 text-ink font-semibold text-sm hover:text-grass-deep border-b border-line/50 transition-colors uppercase tracking-wide"
                  >
                    Stivali
                  </Link>
                  <Link
                    href="/categoria/attrezzature"
                    onClick={() => setOpen(false)}
                    className="px-3 py-3 text-ink font-semibold text-sm hover:text-grass-deep border-b border-line/50 transition-colors uppercase tracking-wide"
                  >
                    Attrezzature
                  </Link>
                </nav>
              </div>

              {/* Sezione Inferiore: Prodotti Consigliati */}
              <div className="p-4 border-t border-line bg-paper-warm shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase text-ink-soft tracking-wider">
                    Consigliati per te
                  </p>
                  <span className="text-[10px] text-grass-deep font-bold">
                    ★ Scelti da noi
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    <div className="h-12 bg-line/30 rounded animate-pulse" />
                    <div className="h-12 bg-line/30 rounded animate-pulse" />
                  </div>
                ) : recommended.length > 0 ? (
                  <div className="space-y-2">
                    {recommended.map((item) => (
                      <Link
                        key={item.id}
                        href={`/prodotto/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 p-2 bg-white border border-line hover:border-grass-deep transition-colors group"
                      >
                        <div className="w-10 h-10 relative bg-paper border border-line shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full bg-line/20 flex items-center justify-center text-[9px] text-ink-soft">
                              Img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-ink truncate group-hover:text-grass-deep transition-colors">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-grass-deep font-mono font-bold">
                            €{Number(item.price).toFixed(2)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-soft italic">
                    Nessun prodotto consigliato al momento.
                  </p>
                )}
              </div>
            </aside>
          </>,
          document.body
        )}
    </div>
  );
}