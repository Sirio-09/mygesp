"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [current, setCurrent] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const hasImages = images && images.length > 0;

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent((c) => (c + 1) % images.length);
  };

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  // Blocco dello scroll della pagina quando la modale è aperta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Gestione tastiera (ESC e Frecce)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length]);

  return (
    <div>
      {/* Immagine Principale in Pagina */}
      <div
        onClick={() => hasImages && setIsOpen(true)}
        className="aspect-square w-full bg-line/20 relative overflow-hidden cursor-pointer group rounded-sm border border-line"
      >
        {hasImages ? (
          <>
            <Image
              src={images[current]}
              alt={productName}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
            {/* Badge Ingrandisci */}
            <div className="absolute bottom-3 right-3 bg-white/95 text-grass-deep border border-line px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider opacity-95 group-hover:bg-grass-deep group-hover:text-white group-hover:border-grass-deep transition-all duration-300 shadow-md z-10 rounded-sm flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              Ingrandisci
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-mono text-ink-soft text-center p-8">
            [nessuna foto]
          </div>
        )}

        {/* Frecce In Pagina */}
        {hasImages && images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-grass-deep hover:text-white text-grass-deep w-9 h-9 flex items-center justify-center z-10 shadow-md border border-line rounded-sm transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Foto precedente"
            >
              <svg className="w-4 h-4 stroke-current stroke-[2.5]" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-grass-deep hover:text-white text-grass-deep w-9 h-9 flex items-center justify-center z-10 shadow-md border border-line rounded-sm transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Foto successiva"
            >
              <svg className="w-4 h-4 stroke-current stroke-[2.5]" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Selettore Miniature */}
      {hasImages && images.length > 1 && (
        <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-16 h-16 relative border-2 flex-shrink-0 transition-all rounded-sm overflow-hidden ${
                current === i
                  ? "border-grass-deep opacity-100 ring-2 ring-grass-deep/20 -translate-y-0.5 shadow-sm"
                  : "border-line opacity-60 hover:opacity-100 hover:border-ink/40"
              }`}
            >
              <Image src={img} alt={`${productName} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* MODALE LIGHTBOX */}
      {isOpen && hasImages && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[9999] bg-black/80 select-none"
        >
          {/* Area centrale tra navbar e fondo schermo */}
          <div className="absolute top-16 sm:top-20 bottom-0 inset-x-0 flex flex-col items-center justify-center p-4 sm:p-6 pointer-events-none">
            
            {/* Box Immagine */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[55vh] sm:h-[65vh] flex items-center justify-center pointer-events-auto"
            >
              {/* Tasto ESCI */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-0 right-0 -translate-y-1/2 z-[10000] text-grass-deep bg-white hover:bg-grass-deep hover:text-white border border-line rounded-sm px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Esci dallo zoom"
              >
                <span>Esci</span>
                <span className="text-xs font-mono leading-none">✕</span>
              </button>

              <Image
                src={images[current]}
                alt={`${productName} ingrandito`}
                fill
                className="object-contain"
                priority
              />

              {/* Frecce Modale */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 bg-white text-grass-deep hover:bg-grass-deep hover:text-white w-10 h-10 sm:w-12 sm:h-12 rounded-sm flex items-center justify-center transition-all duration-200 border border-line z-[10000] cursor-pointer shadow-xl hover:scale-110 active:scale-95"
                    aria-label="Foto precedente"
                  >
                    <svg className="w-5 h-5 stroke-current stroke-[2.5]" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 bg-white text-grass-deep hover:bg-grass-deep hover:text-white w-10 h-10 sm:w-12 sm:h-12 rounded-sm flex items-center justify-center transition-all duration-200 border border-line z-[10000] cursor-pointer shadow-xl hover:scale-110 active:scale-95"
                    aria-label="Foto successiva"
                  >
                    <svg className="w-5 h-5 stroke-current stroke-[2.5]" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Contatore Modale */}
            <div className="mt-5 bg-white border border-line text-grass-deep text-[11px] px-4 py-1.5 rounded-sm font-mono tracking-widest uppercase pointer-events-auto shadow-xl">
              {current + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}