"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  slug: string;
  images: string[];
};

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMobileExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setOpen(false);
    setMobileExpanded(false);
    router.push(`/cerca?q=${encodeURIComponent(query)}`);
  };

  const closeMobileSearch = () => {
    setOpen(false);
    setMobileExpanded(false);
  };

  return (
    <div ref={containerRef} className="relative w-full lg:w-72">
      {/* Overlay scuro per Mobile */}
      {mobileExpanded && (
        <div
          onClick={closeMobileSearch}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Pulsante Icona Cerca per Mobile */}
      {!mobileExpanded && (
        <button
          onClick={() => setMobileExpanded(true)}
          className="lg:hidden text-ink p-2 text-lg hover:text-grass-deep transition-colors"
          aria-label="Apri ricerca"
        >
          🔍
        </button>
      )}

      {/* Form di Ricerca */}
      <form
        onSubmit={handleSubmit}
        className={
          mobileExpanded
            ? "fixed inset-x-4 top-4 z-50 flex items-center gap-2 bg-white p-2 border border-line shadow-2xl lg:static lg:p-0 lg:border-none lg:shadow-none lg:bg-transparent lg:w-full"
            : "hidden lg:block lg:w-full"
        }
      >
        <input
          type="text"
          autoFocus={mobileExpanded}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Cerca prodotti..."
          className="bg-white text-ink placeholder:text-ink-soft/60 text-sm px-3.5 py-2 border border-line focus:border-grass-deep outline-none w-full transition-all"
        />

        {/* Pulsante Chiusura per Mobile */}
        {mobileExpanded && (
          <button
            type="button"
            onClick={closeMobileSearch}
            className="lg:hidden p-2 text-ink-soft hover:text-ink font-bold text-sm"
            aria-label="Chiudi ricerca"
          >
            ✕
          </button>
        )}
      </form>

      {/* Dropdown Risultati con la stessa larghezza dell'input */}
      {open && results.length > 0 && (
        <div
          className={`bg-white border border-line z-50 shadow-xl overflow-hidden ${
            mobileExpanded
              ? "fixed inset-x-4 top-20 max-w-none max-h-[65vh] overflow-y-auto"
              : "absolute top-full left-0 right-0 w-full mt-1.5"
          }`}
        >
          {/* Header del dropdown */}
          <div className="bg-paper-warm px-3.5 py-2 border-b border-line flex items-center justify-between sticky top-0 z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">
              Suggerimenti
            </span>
            <span className="text-[10px] font-mono font-bold text-grass-deep">
              {results.length} trovati
            </span>
          </div>

          {/* Lista Prodotti */}
          <div className="divide-y divide-line">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/prodotto/${product.slug}`}
                onClick={closeMobileSearch}
                className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-paper-warm transition-colors group"
              >
                <div className="w-10 h-10 bg-paper-warm border border-line relative flex-shrink-0 overflow-hidden">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-ink-soft font-mono">
                      No img
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-ink group-hover:text-grass-deep truncate transition-colors">
                  {product.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Footer del Dropdown */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-paper-warm hover:bg-grass hover:text-white text-ink text-xs font-bold py-2.5 px-3.5 border-t border-line text-center transition-colors flex items-center justify-between group sticky bottom-0"
          >
            <span className="truncate">Vedi tutti i risultati</span>
            <span className="group-hover:translate-x-1 transition-transform flex-shrink-0">→</span>
          </button>
        </div>
      )}
    </div>
  );
}