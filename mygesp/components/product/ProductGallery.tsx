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
    <div className="space-y-4">
      {/* Immagine Principale */}
      <div
        onClick={() => hasImages && setIsOpen(true)}
        className="aspect-square w-full bg-transparent relative overflow-hidden cursor-pointer group border border-line/40"
      >
        {hasImages ? (
          <>
            <Image
              src={images[current]}
              alt={productName}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            
            {/* Badge Ingrandisci */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-ink border border-line/40 px-4 py-2 text-[9px] font-semibold uppercase tracking-widest opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 flex items-center gap-2">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              Espandi
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-mono uppercase tracking-widest text-ink-soft text-center p-8">
            Nessuna immagine
          </div>
        )}

        {/* Frecce Navigazione In Pagina (visibili solo in hover sul contenitore) */}
        {hasImages && images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-ink hover:text-grass w-10 h-10 flex items-center justify-center z-10 border border-line/40 opacity-0 group-hover:opacity-100 transition-all duration-300"
              aria-label="Foto precedente"
            >
              <svg className="w-4 h-4 stroke-current stroke-[1.5]" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-ink hover:text-grass w-10 h-10 flex items-center justify-center z-10 border border-line/40 opacity-0 group-hover:opacity-100 transition-all duration-300"
              aria-label="Foto successiva"
            >
              <svg className="w-4 h-4 stroke-current stroke-[1.5]" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Selettore Miniature */}
      {hasImages && images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-20 h-20 relative flex-shrink-0 transition-all duration-300 border ${
                current === i
                  ? "border-grass opacity-100"
                  : "border-line/40 opacity-50 hover:opacity-100 hover:border-ink/40"
              }`}
            >
              <Image src={img} alt={`${productName} anteprima ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* MODALE LIGHTBOX ESTESA */}
      {isOpen && hasImages && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[9999] bg-ink/95 backdrop-blur-md select-none flex flex-col items-center justify-center"
        >
          {/* Header Modale */}
          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center pointer-events-none">
            <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase">
              {current + 1} / {images.length} — {productName}
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="pointer-events-auto text-white/70 hover:text-white flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest transition-colors group"
              aria-label="Chiudi"
            >
              <span>Chiudi</span>
              <span className="w-8 h-8 flex items-center justify-center border border-white/20 group-hover:border-white/60 transition-colors">
                ✕
              </span>
            </button>
          </div>

          {/* Area Centrale Immagine */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl h-[75vh] flex items-center justify-center"
          >
            <Image
              src={images[current]}
              alt={`${productName} ingrandito`}
              fill
              className="object-contain"
              priority
            />

            {/* Frecce Modale Minimali */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white w-12 h-12 flex items-center justify-center transition-colors z-[10000]"
                  aria-label="Precedente"
                >
                  <svg className="w-8 h-8 stroke-current stroke-[1]" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white w-12 h-12 flex items-center justify-center transition-colors z-[10000]"
                  aria-label="Successiva"
                >
                  <svg className="w-8 h-8 stroke-current stroke-[1]" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}