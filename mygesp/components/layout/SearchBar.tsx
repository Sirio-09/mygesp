// SearchBar.tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  slug: string;
  images: string[];
};

function SearchBarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cerca?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setResults(data.slice(0, 5));
          setOpen(data.length > 0);
        } else {
          setResults([]);
          setOpen(false);
        }
      } catch (err) {
        console.error("Errore fetch ricerca:", err);
        setResults([]);
        setOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setMobileExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobileSearch = () => {
    setOpen(false);
    setMobileExpanded(false);
  };

  const handleProductSelect = (slug: string) => {
    closeMobileSearch();
    router.push(`/prodotto/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    closeMobileSearch();
    router.push(`/prodotti?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={containerRef} className="relative w-full lg:w-72">
      {/* Overlay mobile */}
      {mobileExpanded && (
        <div
          onClick={closeMobileSearch}
          className="fixed inset-0 bg-paper/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Pulsante ricerca mobile */}
      {!mobileExpanded && (
        <button
          onClick={() => setMobileExpanded(true)}
          className="lg:hidden text-ink-soft hover:text-ink transition-colors flex items-center justify-center p-1"
          aria-label="Apri ricerca"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16" y2="16" />
          </svg>
        </button>
      )}

      {/* Form di ricerca */}
      <form
        onSubmit={handleSubmit}
        className={
          mobileExpanded
            ? "fixed inset-x-4 top-4 z-50 flex items-center bg-white border border-line/40 shadow-sm lg:static lg:bg-transparent lg:w-full lg:border-none lg:shadow-none"
            : "hidden lg:block lg:w-full"
        }
      >
        <div className="relative w-full flex items-center">
          <input
            type="text"
            autoFocus={mobileExpanded}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Cerca prodotto..."
            className="w-full bg-transparent text-ink placeholder:text-ink-soft/40 text-sm font-light px-4 py-2 border-b border-line/60 focus:border-ink outline-none transition-colors"
          />
          {mobileExpanded && (
            <button
              type="button"
              onClick={closeMobileSearch}
              className="lg:hidden absolute right-3 text-ink-soft hover:text-ink p-1"
              aria-label="Chiudi ricerca"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Dropdown dei suggerimenti */}
      {open && results.length > 0 && (
        <div
          className={`bg-white border border-line/40 z-50 ${
            mobileExpanded
              ? "fixed inset-x-4 top-20 max-w-none max-h-[65vh] overflow-y-auto shadow-sm"
              : "absolute top-full left-0 right-0 w-full mt-2"
          }`}
        >
          <div className="px-4 py-3 border-b border-line/40 flex items-center justify-between sticky top-0 bg-white z-10">
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
              Suggerimenti
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink">
              {results.length} trovati
            </span>
          </div>

          <div className="divide-y divide-line/40">
            {results.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleProductSelect(product.slug)}
                className="w-full text-left flex items-center gap-4 px-4 py-3 hover:bg-line/5 transition-colors group cursor-pointer"
              >
                <div className="w-10 h-10 bg-paper relative flex-shrink-0 overflow-hidden">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] uppercase tracking-widest text-ink-soft/50">
                      Img
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium text-ink uppercase tracking-widest group-hover:text-grass transition-colors truncate">
                  {product.name}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-transparent hover:bg-ink hover:text-white text-ink text-[10px] font-semibold uppercase tracking-[0.2em] py-4 px-4 border-t border-line/40 text-center transition-colors flex items-center justify-between group sticky bottom-0 cursor-pointer"
          >
            <span className="truncate">Tutti i risultati</span>
            <span className="transform group-hover:translate-x-1 transition-transform flex-shrink-0">
              &rarr;
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchBar() {
  return (
    <Suspense
      fallback={
        <div className="relative w-full lg:w-72 flex items-center">
          <input
            type="text"
            placeholder="Cerca prodotto..."
            readOnly
            className="w-full bg-transparent text-ink placeholder:text-ink-soft/40 text-sm font-light px-4 py-2 border-b border-line/60 outline-none"
          />
        </div>
      }
    >
      <SearchBarContent />
    </Suspense>
  );
}