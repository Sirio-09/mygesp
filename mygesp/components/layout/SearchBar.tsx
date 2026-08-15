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
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/cerca?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.slice(0, 5));
      setOpen(true);
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

  return (
    <div ref={containerRef} className="relative">
      {/* icona sola, solo su mobile, quando non espanso */}
      {!mobileExpanded && (
        <button
          onClick={() => setMobileExpanded(true)}
          className="md:hidden text-canvas text-lg"
          aria-label="Cerca"
        >
          ⌕
        </button>
      )}

      {/* campo di ricerca: sempre visibile da md in su, su mobile solo se espanso */}
      <form
        onSubmit={handleSubmit}
        className={mobileExpanded ? "fixed inset-x-4 top-20 z-50 md:static md:inset-auto" : "hidden md:block"}
      >
        <input
          type="text"
          autoFocus={mobileExpanded}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Cerca prodotti..."
          className="bg-loden-deep text-canvas placeholder:text-mud text-sm px-3 py-1.5 border border-canvas-deep focus:border-rust outline-none w-full md:w-56 transition-all md:focus:w-64"
        />
      </form>

      {open && results.length > 0 && (
        <div className={`bg-white border border-mud w-72 z-50 shadow-lg ${
          mobileExpanded
            ? "fixed inset-x-4 top-32 max-w-none"
            : "absolute top-full right-0 mt-1"
        }`}>
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/prodotto/${product.slug}`}
              onClick={() => { setOpen(false); setMobileExpanded(false); }}
              className="flex items-center gap-3 p-2 hover:bg-canvas transition-colors border-b border-canvas-deep last:border-b-0"
            >
              <div className="w-10 h-10 bg-[#DCD4BF] relative flex-shrink-0 overflow-hidden">
                {product.images[0] && (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                )}
              </div>
              <span className="text-sm text-loden-deep truncate">{product.name}</span>
            </Link>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full text-center text-xs text-rust hover:underline p-2 border-t border-canvas-deep"
          >
            Vedi tutti i risultati →
          </button>
        </div>
      )}
    </div>
  );
}