import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;

  const currentPage = Math.max(1, Number(sParams.page) || 1);
  const PAGE_SIZE = 12;

  // Query parallela per recuperare i prodotti e il conteggio totale
  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where: { category: slug },
      include: { variants: true },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({
      where: { category: slug },
    }),
  ]);

  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  const categoryTitles: Record<string, { title: string; desc: string }> = {
    abbigliamento: {
      title: "Abbigliamento Impermeabile",
      desc: "Giacche, salopette e mantelle ad alta tenacità, studiate per garantire protezione 100% impermeabile anche nelle condizioni più estreme.",
    },
    stivali: {
      title: "Stivali e Calzature",
      desc: "Stivali termici e scarponi da lavoro con isolamento dal freddo, massima aderenza antiscivolo e resistenza all'usura.",
    },
    attrezzature: {
      title: "Attrezzature e Accessori",
      desc: "Strumenti, accessori e componenti robusti per affrontare le esigenze e i ritmi del lavoro quotidiano in stalla e nei campi.",
    },
  };

  const categoryInfo = categoryTitles[slug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    desc: "Prodotti tecnici testati sul campo per il lavoro quotidiano.",
  };

  return (
    <main className="bg-paper min-h-screen pb-20 sm:pb-28">
      {/* Header Categoria */}
      <section className="bg-paper-warm/40 border-b border-line py-12 sm:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <nav className="flex items-center gap-2 text-xs text-ink-soft mb-6">
            <Link href="/" className="hover:text-grass-deep transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-ink font-semibold capitalize">{slug}</span>
          </nav>

          <div className="max-w-3xl">
            <p className="text-grass-deep text-xs font-bold uppercase tracking-widest mb-2">
              Catalogo Prodotti
            </p>
            <h1 className="text-ink font-extrabold text-3xl sm:text-5xl tracking-tight mb-4">
              {categoryInfo.title}
            </h1>
            <p className="text-ink-soft text-base sm:text-lg leading-relaxed">
              {categoryInfo.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Griglia Prodotti */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 sm:pt-12">
        {products.length === 0 ? (
          <div className="bg-white border border-line p-12 text-center my-12">
            <p className="text-ink-soft text-base font-medium mb-4">
              Nessun prodotto disponibile in questa pagina.
            </p>
            <Link
              href={`/categoria/${slug}`}
              className="inline-flex items-center text-xs font-bold text-grass-deep uppercase tracking-wider hover:underline"
            >
              ← Torna alla prima pagina
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => {
                const minPriceCents =
                  product.variants && product.variants.length > 0
                    ? Math.min(...product.variants.map((v) => v.priceCents))
                    : 0;

                const isDiscountActive = Boolean(
                  product.discountPercent &&
                    product.discountPercent > 0 &&
                    (!product.discountUntil ||
                      new Date(product.discountUntil) > new Date())
                );

                const discountedPriceCents = isDiscountActive
                  ? Math.round(
                      (minPriceCents * (100 - product.discountPercent!)) / 100
                    )
                  : minPriceCents;

                const formattedPrice = (discountedPriceCents / 100).toFixed(2);
                const formattedFullPrice = (minPriceCents / 100).toFixed(2);

                return (
                  <Link
                    key={product.id}
                    href={`/prodotto/${product.slug}`}
                    className="bg-white block relative group border border-line hover:border-grass-deep transition-colors duration-200"
                  >
                    <div className="aspect-square bg-paper-warm/30 relative w-full overflow-hidden border-b border-line/60">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs text-center p-3 font-mono">
                          [nessuna foto]
                        </div>
                      )}

                      {isDiscountActive && (
                        <span className="absolute top-3 left-3 bg-grass-deep text-white text-xs sm:text-sm font-extrabold px-3 py-1 rounded shadow-md z-10 tracking-wide">
                          -{product.discountPercent}%
                        </span>
                      )}

                      {product.waterColumn && (
                        <span className="absolute top-3 right-3 bg-ink/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm backdrop-blur-sm">
                          {product.waterColumn}MM
                        </span>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 bg-white">
                      <h3 className="text-sm font-bold text-ink mb-3 leading-snug line-clamp-2 group-hover:text-grass-deep transition-colors">
                        {product.name}
                      </h3>
                      {product.variants.length > 0 && (
                        <div className="flex items-baseline gap-2 font-mono">
                          {isDiscountActive ? (
                            <>
                              <span className="font-bold text-base text-grass-deep">
                                €{formattedPrice}
                              </span>
                              <span className="text-xs text-ink-soft/60 line-through">
                                €{formattedFullPrice}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-base text-grass-deep">
                              €{formattedPrice}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Controls di Paginazione */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-line mt-12 pt-6">
                {currentPage > 1 ? (
                  <Link
                    href={`?page=${currentPage - 1}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-line bg-white text-ink text-xs font-bold uppercase tracking-wider hover:bg-paper-warm transition-colors"
                  >
                    ← Precedente
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-line bg-paper-warm text-ink-soft/40 text-xs font-bold uppercase tracking-wider cursor-not-allowed">
                    ← Precedente
                  </span>
                )}

                <span className="text-xs font-mono font-bold text-ink-soft">
                  Pagina <span className="text-ink">{currentPage}</span> di{" "}
                  <span className="text-ink">{totalPages}</span>
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={`?page=${currentPage + 1}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-line bg-white text-ink text-xs font-bold uppercase tracking-wider hover:bg-paper-warm transition-colors"
                  >
                    Successiva →
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-line bg-paper-warm text-ink-soft/40 text-xs font-bold uppercase tracking-wider cursor-not-allowed">
                    Successiva →
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}