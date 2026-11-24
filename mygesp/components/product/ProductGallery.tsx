"use client";
import { useState, useEffect, useCallback, useRef } from "react";
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

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const hasImages = images && images.length > 0;
  const isSingleImage = images?.length === 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  const next = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isSingleImage) setCurrent((c) => (c + 1) % images.length);
  }, [isSingleImage, images.length]);

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isSingleImage) setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [isSingleImage, images.length]);

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

  // Focus trap + ripristino del focus quando il lightbox si chiude
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleTab);
      previouslyFocused?.focus();
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
  }, [isOpen, isSingleImage, images.length, next, prev]);

  if (!hasImages) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center bg-paper-warm text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft lg:aspect-auto lg:h-[var(--gallery-h)]">
        Nessuna immagine
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
      {/* --- 1. ZONA IMMAGINE IN PAGINA --- */}
      <div className="group relative order-1 aspect-[3/4] w-full overflow-hidden bg-paper-warm md:aspect-[4/5] lg:order-2 lg:aspect-auto lg:h-[var(--gallery-h)] lg:flex-1">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`Ingrandisci immagine di ${productName}`}
          aria-haspopup="dialog"
          className="absolute inset-0 cursor-zoom-in"
        >
          {images.map((image, index) => (
            <Image
              key={`${image}-${index}`}
              src={image}
              alt={`${productName} - Vista ${index + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              priority={index === 0}
              aria-hidden={index !== current}
              className={`object-cover transition-opacity duration-500 ease-out-expo ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </button>

        {!isSingleImage && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-line bg-paper/95 text-ink transition-all duration-300 ease-out-expo hover:border-ink hover:bg-paper md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
              aria-label="Precedente"
            >
              <svg className="h-5 w-5 stroke-current stroke-[1.5]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              onClick={next}
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-line bg-paper/95 text-ink transition-all duration-300 ease-out-expo hover:border-ink hover:bg-paper md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
              aria-label="Successiva"
            >
              <svg className="h-5 w-5 stroke-current stroke-[1.5]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="pointer-events-none absolute bottom-3 right-3 bg-paper/90 px-2.5 py-1 text-[10px] font-semibold tabular-nums tracking-[0.2em] text-ink">
              {String(current + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </div>
          </>
        )}
      </div>

      {/* --- 1b. MINIATURE: strip orizzontale su mobile, rail verticale su desktop --- */}
      {!isSingleImage && (
        <div className="order-2 lg:order-1 lg:w-16 lg:shrink-0">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:max-h-[var(--gallery-h)] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Mostra immagine ${index + 1}`}
                aria-current={index === current}
                className={`relative aspect-[4/5] w-[calc((100%_-_2rem)_/_5)] shrink-0 overflow-hidden border transition-colors duration-200 ease-out-expo sm:w-20 lg:w-full ${
                  index === current
                    ? "border-line"
                    : "border-transparent hover:border-line"
                }`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="64px"
                  className={`object-cover transition-opacity duration-300 ease-out-expo ${
                    index === current ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-ink transition-transform duration-500 ease-out-expo ${
                    index === current ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- 2. LIGHTBOX FULLSCREEN (PORTAL) --- */}
      {mounted && isOpen && createPortal(
        <div
          ref={dialogRef}
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Galleria immagini"
          className="fixed inset-0 z-[999999] flex animate-fade-in cursor-zoom-out flex-col items-center justify-center bg-paper"
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
              className="animate-scale-in object-contain"
              quality={100}
              sizes="100vw"
              priority
            />

            {/* Frecce Navigazione Laterali GIGANTI - z-[100000] */}
            {!isSingleImage && (
              <>
                <button
                  onClick={prev}
                  aria-label="Precedente"
                  className="group absolute left-0 top-0 bottom-0 flex w-[25%] cursor-pointer items-center justify-start p-4 text-ink/25 transition-colors duration-300 hover:text-ink focus-visible:text-ink md:w-32 md:p-8"
                >
                  <svg className="h-10 w-10 stroke-current stroke-[1] transition-transform duration-300 ease-out-expo group-hover:-translate-x-1.5 md:h-14 md:w-14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={next}
                  aria-label="Successiva"
                  className="group absolute right-0 top-0 bottom-0 flex w-[25%] cursor-pointer items-center justify-end p-4 text-ink/25 transition-colors duration-300 hover:text-ink focus-visible:text-ink md:w-32 md:p-8"
                >
                  <svg className="h-10 w-10 stroke-current stroke-[1] transition-transform duration-300 ease-out-expo group-hover:translate-x-1.5 md:h-14 md:w-14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                
                {/* Contatore in basso */}
                <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 text-[10px] font-semibold tabular-nums tracking-[0.2em] text-ink">
                  {String(current + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </div>
              </>
            )}
          </div>

          {/* Header Lightbox: X (Ora posizionata alla fine e con z-index SUPERIORE alle frecce: z-[100010]) */}
          <div className="absolute top-0 right-0 p-4 md:p-8 z-[100010] pointer-events-none">
            <button
              ref={closeButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="pointer-events-auto flex items-center justify-center border border-line bg-paper/90 p-3 text-ink transition-all duration-300 ease-out-expo hover:border-ink hover:rotate-90 md:border-transparent md:bg-transparent md:p-4"
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