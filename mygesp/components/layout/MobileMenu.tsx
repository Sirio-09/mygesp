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
    };
  }, [open]);

  // Carica i prodotti consigliati quando il menu viene aperto
  useEffect(() => {
    if (open) {
      setLoading(true);
      // Puoi aumentare il parametro limit (es. limit=6) per far scorrere più prodotti
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

      {mounted &&
        createPortal(
          <>
            <div
              onClick={() => setOpen(false)}
              className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] transition-opacity duration-300 ease-in-out ${
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            />

            <aside
              className={`fixed top-0 left-0 bottom-0 h-screen w-[85%] max-w-xs bg-paper z-[999] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* HEADER DEL MENU */}
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

              {/* NAVIGAZIONE PRINCIPALE */}
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

              {/* FOOTER DEL MENU: PRODOTTI CONSIGLIATI SCORREVOLI */}
              <div className="p-4 border-t border-line bg-paper-warm shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase text-ink-soft tracking-wider">
                    Consigliati per te
                  </p>
                  <span className="text-[10px] text-grass-deep font-bold">
                    ★ In evidenza
                  </span>
                </div>

                {loading ? (
                  <div className="flex gap-3 overflow-hidden">
                    <div className="w-28 h-36 bg-line/30 rounded animate-pulse shrink-0" />
                    <div className="w-28 h-36 bg-line/30 rounded animate-pulse shrink-0" />
                  </div>
                ) : recommended.length > 0 ? (
                  /* Contenitore con scroll orizzontale */
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-line snap-x snap-mandatory">
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
                          className="flex flex-col w-28 shrink-0 bg-white border border-line hover:border-grass-deep transition-colors p-2 snap-start group"
                        >
                          {/* Immagine del prodotto */}
                          <div className="w-full h-24 relative bg-paper border border-line overflow-hidden mb-2">
                            {imageSrc ? (
                              <Image
                                src={imageSrc}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full bg-line/20 flex items-center justify-center text-[9px] text-ink-soft">
                                No img
                              </div>
                            )}
                          </div>

                          {/* Dettagli disposti verticalmente */}
                          <div className="flex flex-col justify-between flex-1">
                            <p className="text-[11px] font-semibold text-ink line-clamp-2 leading-tight group-hover:text-grass-deep transition-colors mb-1">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-grass-deep font-mono font-bold">
                              €{formattedPrice}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-ink-soft italic">
                    Nessun prodotto disponibile.
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