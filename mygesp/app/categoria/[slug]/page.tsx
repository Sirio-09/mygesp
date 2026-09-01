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

  // 1. OTTIMIZZAZIONE DB: Usiamo `select` per prendere SOLO i dati strettamente necessari
  const [rawProducts, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where: { category: slug },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        discountPercent: true,
        discountUntil: true,
        waterColumn: true,
        variants: {
          select: { priceCents: true }, // Delle varianti ci serve solo il prezzo per trovare il minimo
        },
      },
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
      desc: "Giacche, salopette e mantelle ad alta tenacità. Progettate per isolare completamente dall'acqua anche nelle condizioni più estreme.",
    },
    stivali: {
      title: "Stivali e Calzature",
      desc: "Stivali termici e scarponi da lavoro con isolamento dal freddo, massima aderenza antiscivolo e resistenza all'usura.",
    },
    attrezzature: {
      title: "Attrezzature e Accessori",
      desc: "Strumenti, accessori e componenti robusti per affrontare le rigide esigenze e i ritmi del lavoro quotidiano sul campo.",
    },
  };

  const categoryInfo = categoryTitles[slug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    desc: "Equipaggiamento tecnico testato sul campo per il lavoro quotidiano.",
  };

  // 2. OTTIMIZZAZIONE LOGICA: Prepariamo i dati prima del JSX per tenerlo pulito
  const products = rawProducts.map((product) => {
    const minPriceCents =
      product.variants.length > 0
        ? Math.min(...product.variants.map((v) => v.priceCents))
        : 0;

    const isDiscountActive = Boolean(
      product.discountPercent &&
        product.discountPercent > 0 &&
        (!product.discountUntil || product.discountUntil > new Date())
    );

    const discountedPriceCents = isDiscountActive
      ? Math.round((minPriceCents * (100 - product.discountPercent!)) / 100)
      : minPriceCents;

    return {
      ...product,
      minPriceCents,
      isDiscountActive,
      formattedPrice: (discountedPriceCents / 100).toFixed(2),
      formattedFullPrice: (minPriceCents / 100).toFixed(2),
    };
  });

  return (
    <main className="bg-paper min-h-screen pb-24 sm:pb-32 text-ink selection:bg-grass selection:text-white">
      {/* HEADER CATEGORIA */}
      <section className="border-b border-line/40 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <nav className="flex items-center gap-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft mb-10">
            <Link href="/" className="hover:text-grass transition-colors">
              Home
            </Link>
            <span className="text-line/60">/</span>
            <span className="text-ink">{slug}</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-ink font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6">
              {categoryInfo.title}
            </h1>
            <p className="text-ink-soft text-base sm:text-lg font-light leading-relaxed">
              {categoryInfo.desc}
            </p>
          </div>
        </div>
      </section>

      {/* GRIGLIA PRODOTTI */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-24">
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-ink-soft font-light text-lg mb-6">
              Nessun prodotto attualmente disponibile in questa sezione.
            </p>
            <Link
              href={`/categoria/${slug}`}
              className="inline-flex items-center text-xs font-medium text-ink uppercase tracking-widest hover:text-grass transition-colors"
            >
              &larr; Torna alla prima pagina
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/prodotto/${product.slug}`}
                  className="group flex flex-col"
                >
                  <div className="aspect-[4/5] bg-paper relative w-full overflow-hidden mb-5">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        // 3. OTTIMIZZAZIONE IMMAGINI: sizes previene il download di formati giganteschi
                        sizes="(max-width: 768px) 50vw, 25vw"
                        // Priority true solo per i primi 4 elementi (quelli visibili above-the-fold)
                        priority={index < 4}
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs uppercase tracking-widest font-light bg-line/10">
                        Nessuna immagine
                      </div>
                    )}

                    {/* Badge Sconto Elegante */}
                    {product.isDiscountActive && (
                      <span className="absolute top-4 left-4 bg-grass text-white text-[10px] sm:text-xs font-medium px-3 py-1.5 uppercase tracking-widest shadow-sm">
                        -{product.discountPercent}%
                      </span>
                    )}

                    {/* Badge Colonna d'Acqua Minimale */}
                    {product.waterColumn && (
                      <span className="absolute top-4 right-4 bg-ink/90 text-white text-[10px] font-medium px-2 py-1 uppercase tracking-widest backdrop-blur-sm shadow-sm">
                        {product.waterColumn}MM
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow">
                    <h3 className="text-sm font-medium text-ink mb-2 leading-snug group-hover:text-grass transition-colors">
                      {product.name}
                    </h3>

                    {product.variants.length > 0 && (
                      <div className="mt-auto pt-2 flex items-baseline gap-3">
                        {product.isDiscountActive ? (
                          <>
                            <span className="font-medium text-sm text-grass">
                              €{product.formattedPrice}
                            </span>
                            <span className="text-xs text-ink-soft line-through">
                              €{product.formattedFullPrice}
                            </span>
                          </>
                        ) : (
                          <span className="font-medium text-sm text-ink-soft">
                            €{product.formattedPrice}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* CONTROLLI DI PAGINAZIONE */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-line/40 mt-24 pt-8">
                {currentPage > 1 ? (
                  <Link
                    href={`?page=${currentPage - 1}`}
                    className="text-xs font-medium uppercase tracking-widest text-ink hover:text-grass transition-colors"
                  >
                    &larr; Precedente
                  </Link>
                ) : (
                  <span className="text-xs font-medium uppercase tracking-widest text-ink-soft/30 cursor-not-allowed">
                    &larr; Precedente
                  </span>
                )}

                <span className="text-xs font-light text-ink-soft uppercase tracking-widest">
                  Pagina <span className="font-medium text-ink">{currentPage}</span> di{" "}
                  <span className="font-medium text-ink">{totalPages}</span>
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={`?page=${currentPage + 1}`}
                    className="text-xs font-medium uppercase tracking-widest text-ink hover:text-grass transition-colors"
                  >
                    Successiva &rarr;
                  </Link>
                ) : (
                  <span className="text-xs font-medium uppercase tracking-widest text-ink-soft/30 cursor-not-allowed">
                    Successiva &rarr;
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