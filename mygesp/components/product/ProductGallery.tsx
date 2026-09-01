"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [current, setCurrent] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const hasImages = images && images.length > 0;
  const isSingleImage = images?.length === 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isSingleImage) setCurrent((c) => (c + 1) % images.length);
  };

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isSingleImage) setCurrent((c) => (c - 1 + images.length) % images.length);
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") setIsOpen(false);
      if (!isSingleImage) {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSingleImage, images.length]);

  if (!hasImages) {
    return (
      <div className="w-full aspect-[3/4] flex items-center justify-center bg-stone-50 text-[10px] font-mono uppercase tracking-widest text-black/40">
        Nessuna immagine
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* --- 1. ZONA IMMAGINE IN PAGINA --- */}
      <div className="relative w-full aspect-[3/4] md:aspect-[4/5] bg-stone-50 group overflow-hidden">
        
        <div onClick={() => setIsOpen(true)} className="absolute inset-0 cursor-zoom-in">
          <Image
            src={images[current]}
            alt={`${productName} - Vista ${current + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            priority
          />
        </div>

        {!isSingleImage && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-black shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10"
              aria-label="Precedente"
            >
              <svg className="w-6 h-6 stroke-current stroke-[1.5] -translate-x-[1px]" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              onClick={next}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-black shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10"
              aria-label="Successiva"
            >
              <svg className="w-6 h-6 stroke-current stroke-[1.5] translate-x-[1px]" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-1.5 text-[10px] font-mono tracking-widest pointer-events-none rounded-full shadow-sm text-black">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* --- 2. LIGHTBOX FULLSCREEN (PORTAL) --- */}
      {mounted && isOpen && createPortal(
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[999999] bg-white flex flex-col items-center justify-center cursor-zoom-out animate-in fade-in duration-200"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Immagine Centrale */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-[100dvh] flex items-center justify-center p-0 md:p-16 cursor-default"
          >
            <Image
              src={images[current]}
              alt={`${productName} vista ingrandita`}
              fill
              className="object-contain animate-in zoom-in-[0.98] duration-300 ease-out"
              quality={100}
              priority
            />

            {/* Frecce Navigazione Laterali GIGANTI - z-[100000] */}
            {!isSingleImage && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-0 top-0 bottom-0 w-[25%] md:w-32 flex items-center justify-start p-4 md:p-8 text-black/30 hover:text-black/90 transition-colors z-[100000] cursor-pointer group outline-none"
                >
                  <svg className="w-12 h-12 md:w-16 md:h-16 stroke-current stroke-[1] group-hover:-translate-x-2 transition-transform duration-300 drop-shadow-md" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={next}
                  className="absolute right-0 top-0 bottom-0 w-[25%] md:w-32 flex items-center justify-end p-4 md:p-8 text-black/30 hover:text-black/90 transition-colors z-[100000] cursor-pointer group outline-none"
                >
                  <svg className="w-12 h-12 md:w-16 md:h-16 stroke-current stroke-[1] group-hover:translate-x-2 transition-transform duration-300 drop-shadow-md" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                
                {/* Contatore in basso */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] font-mono text-black/60 tracking-[0.2em] pointer-events-none bg-white/80 px-4 py-2 rounded-full shadow-sm md:bg-transparent md:shadow-none">
                  {current + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Header Lightbox: X (Ora posizionata alla fine e con z-index SUPERIORE alle frecce: z-[100010]) */}
          <div className="absolute top-0 right-0 p-4 md:p-8 z-[100010] pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="pointer-events-auto p-4 flex items-center justify-center text-black/50 hover:text-black hover:rotate-90 transition-all duration-300 cursor-pointer bg-white/50 backdrop-blur-md rounded-full md:bg-transparent"
              aria-label="Chiudi"
            >
              <svg className="w-8 h-8 md:w-10 md:h-10 stroke-current stroke-[1.5]" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}