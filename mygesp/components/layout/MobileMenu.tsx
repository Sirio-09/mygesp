"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";

type Variant = {
  priceCents: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  variants: Variant[];
  featured?: boolean;
};

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/prodotti?featured=true&limit=6", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const list = Array.isArray(data) ? data : data.products || [];
          setRecommended(list);
        })
        .catch((err) => {
          console.error("ERRORE FETCH PRODOTTI IN EVIDENZA:", err);
          setRecommended([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <div className="lg:hidden">
      {/* HAMBURGER BUTTON - Animazione più fluida e area di click migliorata */}
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none relative z-30 hover:opacity-70 transition-opacity"
        aria-label="Apri Menu"
      >
        <span
          className={`w-6 h-0.5 bg-ink rounded-full transition-all duration-300 ease-out ${
            open ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`w-6 h-0.5 bg-ink rounded-full transition-all duration-300 ease-out ${
            open ? "opacity-0 translate-x-2" : ""
          }`}
        />
        <span
          className={`w-6 h-0.5 bg-ink rounded-full transition-all duration-300 ease-out ${
            open ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      {mounted &&
        createPortal(
          <>
            {/* BACKDROP - Blur aumentato per un effetto vetro più premium */}
            <div
              onClick={() => setOpen(false)}
              className={`fixed inset-0 bg-ink/40 backdrop-blur-md z-[998] transition-all duration-400 ease-in-out ${
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            />

            {/* SIDEBAR - Arrotondamento laterale e ombreggiatura profonda */}
            <aside
              className={`fixed top-0 left-0 h-[100dvh] w-[85%] max-w-sm bg-paper z-[999] shadow-2xl rounded-r-2xl flex flex-col justify-between transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* 1. HEADER */}
              <div className="flex items-center justify-between p-5 border-b border-line/40 shrink-0">
                <span className="font-black text-ink text-sm tracking-[0.2em] uppercase">
                  Esplora
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-paper-warm text-ink-soft hover:text-ink hover:bg-line/30 hover:rotate-90 transition-all duration-300"
                  aria-label="Chiudi menu"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 1L13 13M1 13L13 1" />
                  </svg>
                </button>
              </div>

              {/* 2. NAVIGAZIONE - Effetti hover di scorrimento (micro-interazioni) */}
              <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0">
                <nav className="flex flex-col space-y-2">
                  {[
                    { name: "Abbigliamento", href: "/categoria/abbigliamento" },
                    { name: "Stivali", href: "/categoria/stivali" },
                    { name: "Attrezzature", href: "/categoria/attrezzature" },
                  ].map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between px-2 py-3 text-ink font-semibold text-sm hover:bg-paper-warm rounded-lg transition-colors uppercase tracking-widest"
                    >
                      <span className="group-hover:translate-x-2 group-hover:text-grass-deep transition-all duration-300">
                        {link.name}
                      </span>
                      <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-grass-deep">
                        →
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* 3. CONSIGLIATI IN EVIDENZA */}
              <div className="p-5 border-t border-line/40 bg-paper shrink-0 rounded-br-2xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase text-ink tracking-widest">
                    In Evidenza
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-grass-deep font-bold bg-grass-deep/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-grass-deep opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-grass-deep"></span>
                    </span>
                    Novità
                  </div>
                </div>

                {loading ? (
                  <div className="flex gap-4 overflow-hidden pb-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex flex-col w-32 shrink-0 gap-2">
                        <div className="w-full h-32 bg-line/20 rounded-xl animate-pulse" />
                        <div className="w-3/4 h-3 bg-line/20 rounded animate-pulse" />
                        <div className="w-1/2 h-3 bg-line/20 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : recommended.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-4 -mb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory">
                    {recommended.map((item) => {
                      const imageSrc =
                        item.images && item.images.length > 0 ? item.images[0] : null;
                      const priceCents =
                        item.variants && item.variants.length > 0
                          ? item.variants[0].priceCents
                          : 0;
                      const formattedPrice = (priceCents / 100).toFixed(2);

                      return (
                        <Link
                          key={item.id}
                          href={`/prodotto/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex flex-col w-32 shrink-0 bg-paper border border-line/30 rounded-xl hover:border-grass-deep/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-2.5 snap-start group"
                        >
                          {/* Immagine */}
                          <div className="w-full h-28 relative bg-paper-warm overflow-hidden mb-3 rounded-lg">
                            {imageSrc ? (
                              <Image
                                src={imageSrc}
                                alt={item.name}
                                fill
                                sizes="(max-width: 768px) 128px, 128px"
                                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-ink-soft/50">
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Testi e Prezzo */}
                          <div className="flex flex-col justify-between flex-1">
                            <p className="text-[11px] font-bold text-ink line-clamp-2 leading-tight group-hover:text-grass-deep transition-colors mb-2">
                              {item.name}
                            </p>
                            <p className="text-xs text-ink font-mono font-medium bg-paper-warm self-start px-2 py-0.5 rounded-md">
                              €{formattedPrice}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center bg-paper-warm rounded-xl border border-line/30 border-dashed">
                    <span className="text-2xl mb-1">🍃</span>
                    <p className="text-xs text-ink-soft">Nessun prodotto<br/>disponibile al momento.</p>
                  </div>
                )}
              </div>
            </aside>
          </>,
          document.body
        )}
    </div>
  );
}