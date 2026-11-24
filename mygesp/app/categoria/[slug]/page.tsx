import { prisma } from "@/lib/db";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/motion/Reveal";

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

    return {
      ...product,
      minPriceCents,
      isDiscountActive,
    };
  });

  return (
    <main className="bg-paper min-h-screen pb-24 sm:pb-32 text-ink selection:bg-grass selection:text-white">
      {/* HEADER CATEGORIA */}
      <section className="border-b border-line/50 pb-16 pt-16 sm:pb-24 sm:pt-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <nav className="mb-10 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            <Link href="/" className="transition-colors duration-300 hover:text-ink">
              Home
            </Link>
            <span className="text-line">/</span>
            <span className="text-ink">{slug}</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="mb-6 text-4xl font-light tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {categoryInfo.title}
            </h1>
            <p className="text-base font-light leading-relaxed text-ink-soft sm:text-lg">
              {categoryInfo.desc}
            </p>
          </div>
        </div>
      </section>

      {/* GRIGLIA PRODOTTI */}
      <section className="mx-auto max-w-[1280px] px-4 pt-16 sm:px-6 sm:pt-24 lg:px-10">
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-8 text-lg font-light text-ink-soft">
              Nessun prodotto attualmente disponibile in questa sezione.
            </p>
            <Link
              href={`/categoria/${slug}`}
              className="group inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:text-grass-deep"
            >
              <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
              Torna alla prima pagina
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-6 gap-y-16 lg:grid-cols-4">
              {products.map((product, index) => (
                <Reveal
                  key={product.id}
                  delay={Math.min(index % 4, 3) * 70}
                  className="h-full"
                >
                  <ProductCard
                    name={product.name}
                    slug={product.slug}
                    image={product.images[0]}
                    priceCents={product.minPriceCents}
                    discountPercent={product.discountPercent}
                    isDiscountActive={product.isDiscountActive}
                    waterColumn={product.waterColumn}
                    priority={index < 4}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </Reveal>
              ))}
            </div>

            {/* CONTROLLI DI PAGINAZIONE */}
            {totalPages > 1 && (
              <div className="mt-24 flex items-center justify-between border-t border-line/50 pt-8">
                {currentPage > 1 ? (
                  <Link
                    href={`?page=${currentPage - 1}`}
                    className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:text-grass-deep"
                  >
                    <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M11 6l-6 6 6 6" />
                    </svg>
                    Precedente
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft/40">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M11 6l-6 6 6 6" />
                    </svg>
                    Precedente
                  </span>
                )}

                <span className="text-[10px] font-light uppercase tracking-[0.2em] text-ink-soft">
                  Pagina <span className="font-semibold tabular-nums text-ink">{currentPage}</span> di{" "}
                  <span className="font-semibold tabular-nums text-ink">{totalPages}</span>
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={`?page=${currentPage + 1}`}
                    className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:text-grass-deep"
                  >
                    Successiva
                    <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft/40">
                    Successiva
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
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