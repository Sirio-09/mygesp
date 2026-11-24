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
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
        className="relative z-30 flex h-10 w-10 flex-col items-center justify-center gap-1.5 transition-opacity hover:opacity-70"
        aria-label="Apri Menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
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
              className={`fixed inset-0 z-[998] bg-ink/40 backdrop-blur-md transition-opacity duration-300 ease-out-expo ${
                open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden="true"
            />

            {/* SIDEBAR */}
            <aside
              id="mobile-menu"
              className={`fixed left-0 top-0 z-[999] flex h-[100dvh] w-[85%] max-w-sm transform-gpu flex-col justify-between bg-paper shadow-[0_0_80px_-20px_rgba(34,40,31,0.45)] will-change-transform transition-transform duration-500 ease-out-expo ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* 1. HEADER */}
              <div className="flex shrink-0 items-center justify-between border-b border-line/40 p-5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
                  Esplora
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 ease-out-expo hover:bg-paper-warm hover:text-ink"
                  aria-label="Chiudi menu"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M1 1L13 13M1 13L13 1" />
                  </svg>
                </button>
              </div>

              {/* 2. NAVIGAZIONE */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
                <nav className="flex flex-col">
                  {[
                    { name: "Abbigliamento", href: "/categoria/abbigliamento" },
                    { name: "Stivali", href: "/categoria/stivali" },
                    { name: "Attrezzature", href: "/categoria/attrezzature" },
                  ].map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between border-b border-line/40 px-1 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors duration-300 ease-out-expo hover:text-grass-deep"
                    >
                      <span>{link.name}</span>
                      <svg
                        className="h-4 w-4 -translate-x-1 text-grass-deep opacity-0 transition-all duration-300 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* 3. CONSIGLIATI IN EVIDENZA */}
              <div className="shrink-0 border-t border-line/40 bg-paper p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                    In Evidenza
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-grass-deep">
                    <span className="h-1.5 w-1.5 rounded-full bg-grass-deep" aria-hidden="true" />
                    Novità
                  </div>
                </div>

                {loading ? (
                  <div className="flex gap-4 overflow-hidden pb-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex w-32 shrink-0 flex-col gap-2">
                        <div className="h-32 w-full bg-line/25" />
                        <div className="h-3 w-3/4 bg-line/25" />
                        <div className="h-3 w-1/2 bg-line/25" />
                      </div>
                    ))}
                  </div>
                ) : recommended.length > 0 ? (
                  <div className="no-scrollbar -mb-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 pt-1">
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
                          className="group flex w-32 shrink-0 snap-start flex-col p-0"
                        >
                          {/* Immagine */}
                          <div className="relative mb-3 h-28 w-full overflow-hidden bg-paper-warm">
                            {imageSrc ? (
                              <Image
                                src={imageSrc}
                                alt={item.name}
                                fill
                                sizes="128px"
                                className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.04]"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-ink-soft/50">
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Testi e Prezzo */}
                          <div className="flex flex-1 flex-col justify-between">
                            <p className="mb-2 line-clamp-2 text-[11px] font-medium leading-snug text-ink transition-colors duration-200 group-hover:text-grass-deep">
                              {item.name}
                            </p>
                            <p className="self-start text-[11px] font-medium tabular-nums text-ink-soft">
                              €{formattedPrice}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-line bg-paper-warm/60 py-6 text-center">
                    <svg className="h-6 w-6 text-ink-soft/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <p className="text-[11px] font-light leading-relaxed text-ink-soft">
                      Nessun prodotto<br />disponibile al momento.
                    </p>
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