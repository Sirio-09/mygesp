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
        role="search"
        className={
          mobileExpanded
            ? "fixed inset-x-4 top-4 z-50 flex items-center border border-line bg-white lg:static lg:w-full lg:border-none lg:bg-transparent"
            : "hidden lg:block lg:w-full"
        }
      >
        <div className="relative flex w-full items-center">
          <svg
            className="pointer-events-none absolute left-0 h-4 w-4 text-ink-soft/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            autoFocus={mobileExpanded}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Cerca prodotto..."
            aria-label="Cerca prodotto"
            className="w-full border-b border-line/60 bg-transparent py-2 pl-7 pr-8 text-sm font-light text-ink outline-none transition-colors duration-300 placeholder:text-ink-soft/70 focus:border-ink lg:pl-7"
          />
          {mobileExpanded && (
            <button
              type="button"
              onClick={closeMobileSearch}
              className="absolute right-2 flex items-center justify-center p-1.5 text-ink-soft transition-colors duration-200 hover:text-ink lg:hidden"
              aria-label="Chiudi ricerca"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
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
          className={`z-50 animate-fade-in border border-line bg-white ${
            mobileExpanded
              ? "fixed inset-x-4 top-20 max-h-[65vh] max-w-none overflow-y-auto"
              : "absolute left-0 right-0 top-full mt-2 w-full"
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

          <div className="divide-y divide-line/60">
            {results.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleProductSelect(product.slug)}
                className="group flex w-full cursor-pointer items-center gap-4 px-4 py-3 text-left transition-colors duration-200 hover:bg-paper-warm"
              >
                <div className="relative h-11 w-9 shrink-0 overflow-hidden bg-paper-warm">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="36px"
                      className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-soft/60">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-ink transition-colors duration-200 group-hover:text-grass-deep">
                  {product.name}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="group sticky bottom-0 flex w-full cursor-pointer items-center justify-between border-t border-line bg-white px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-ink hover:text-white"
          >
            <span className="truncate">Tutti i risultati</span>
            <svg className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
            </svg>
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
        <div className="relative flex w-full items-center lg:w-72">
          <input
            type="text"
            placeholder="Cerca prodotto..."
            aria-label="Cerca prodotto"
            readOnly
            className="w-full border-b border-line/60 bg-transparent py-2 pl-7 pr-4 text-sm font-light text-ink outline-none placeholder:text-ink-soft/70"
          />
        </div>
      }
    >
      <SearchBarContent />
    </Suspense>
  );
}