import { prisma } from "@/lib/db";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/motion/Reveal";

interface ProductsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const whereCondition = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { brand: { contains: query, mode: "insensitive" as const } },
          { shortTitle: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const products = await prisma.product.findMany({
    where: whereCondition,
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line/50 pb-12 pt-16 sm:pb-16 sm:pt-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            {query ? "Risultati di ricerca" : "La nostra selezione"}
          </p>
          <h1 className="text-3xl font-light tracking-tight text-ink sm:text-5xl">
            {query ? `Ricerca per "${query}"` : "Catalogo Prodotti"}
          </h1>
          <p className="mt-4 text-sm font-light text-ink-soft">
            {products.length} {products.length === 1 ? "prodotto disponibile" : "prodotti disponibili"}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
        {products.length === 0 ? (
          <div className="mx-auto max-w-xl border border-dashed border-line px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-line text-ink-soft/60">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </div>
            <h2 className="mb-3 text-xl font-light tracking-tight text-ink">Nessun prodotto trovato</h2>
            <p className="mb-8 text-sm font-light leading-relaxed text-ink-soft">
              Non abbiamo trovato nulla per la tua ricerca. Esplora le altre categorie.
            </p>
            <Link
              href="/prodotti"
              className="group inline-flex items-center gap-3 bg-ink px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-grass"
            >
              Mostra tutto il catalogo
              <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {products.map((product, index) => {
              const minPriceCents = product.variants?.length > 0
                ? Math.min(...product.variants.map((v) => v.priceCents))
                : 0;

              const isDiscountActive = Boolean(
                product.discountPercent &&
                  product.discountPercent > 0 &&
                  (!product.discountUntil || new Date(product.discountUntil) > new Date())
              );

              return (
                <Reveal
                  key={product.id}
                  delay={Math.min(index % 4, 3) * 70}
                  className="h-full"
                >
                  <ProductCard
                    name={product.name}
                    slug={product.slug}
                    image={product.images[0]}
                    priceCents={minPriceCents}
                    discountPercent={product.discountPercent}
                    isDiscountActive={isDiscountActive}
                    waterColumn={product.waterColumn}
                    brand={product.brand}
                    priority={index < 4}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
                  />
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
