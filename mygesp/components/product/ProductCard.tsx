// ProductCard.tsx
// Card prodotto unica per home, categoria, catalogo, ricerca e correlati.
import Link from "next/link";
import Image from "next/image";

export type ProductCardProps = {
  name: string;
  slug: string;
  image?: string | null;
  /** Prezzo di partenza in centesimi (0 = nessun prezzo disponibile) */
  priceCents: number;
  discountPercent?: number | null;
  isDiscountActive?: boolean;
  waterColumn?: number | null;
  brand?: string | null;
  priority?: boolean;
  sizes?: string;
  headingLevel?: "h2" | "h3";
};

export default function ProductCard({
  name,
  slug,
  image,
  priceCents,
  discountPercent,
  isDiscountActive = false,
  waterColumn,
  brand,
  priority = false,
  sizes = "(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px",
  headingLevel = "h3",
}: ProductCardProps) {
  const Heading = headingLevel;

  const hasPrice = priceCents > 0;
  const discountedPriceCents =
    isDiscountActive && discountPercent
      ? Math.round((priceCents * (100 - discountPercent)) / 100)
      : priceCents;

  const formattedPrice = (discountedPriceCents / 100).toFixed(2);
  const formattedFullPrice = (priceCents / 100).toFixed(2);

  return (
    <Link href={`/prodotto/${slug}`} className="group flex h-full flex-col">
      {/* Immagine */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-warm">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover object-center transition-transform duration-[700ms] ease-out-expo will-change-transform group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-soft/60">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[9px] font-medium uppercase tracking-[0.2em]">
              Nessuna immagine
            </span>
          </div>
        )}

        {isDiscountActive && discountPercent ? (
          <span className="absolute left-0 top-0 bg-grass px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            -{discountPercent}%
          </span>
        ) : null}

        {waterColumn ? (
          <span className="absolute right-0 top-0 bg-paper/90 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink backdrop-blur-sm">
            {waterColumn} mm
          </span>
        ) : null}

        {/* Chip freccia in hover: affordance di navigazione */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 translate-y-1.5 items-center justify-center border border-line bg-paper/95 text-ink opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>

      {/* Testi */}
      <div className="mt-4 flex flex-1 flex-col border-t border-line/50 pt-4">
        {brand ? (
          <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            {brand}
          </span>
        ) : null}

        <Heading className="line-clamp-2 text-sm font-medium leading-snug text-ink transition-colors duration-300 ease-out-expo group-hover:text-grass-deep">
          {name}
        </Heading>

        {hasPrice ? (
          <div className="mt-auto flex items-baseline gap-3 pt-2.5 tabular-nums">
            {isDiscountActive ? (
              <>
                <span className="text-sm font-medium text-grass-deep">
                  €{formattedPrice}
                </span>
                <span className="text-xs font-light text-ink-soft line-through">
                  €{formattedFullPrice}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-ink-soft">
                €{formattedPrice}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
