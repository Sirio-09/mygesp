import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductGallery from "@/components/product/ProductGallery";
import ProductReviews from "@/components/product/ProductReviews";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/motion/Reveal";

type DescriptionBlock = {
  title: string;
  text: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return { title: "Prodotto non trovato — MyGesp" };
  }

  const blocks = product.descriptionBlocks as unknown as DescriptionBlock[];
  const firstText = product.shortDescription ?? blocks?.[0]?.text ?? product.name;

  return {
    title: `${product.name} — ${product.brand} | MyGesp`,
    description: firstText,
    openGraph: {
      title: product.name,
      description: firstText,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  });

  if (!product) {
    notFound();
  }

  // Prodotti correlati (stessa categoria, escluso il prodotto corrente)
  let relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      NOT: { id: product.id },
    },
    include: { variants: true },
    take: 4,
  });

  // Fallback se la categoria ha meno di 4 prodotti correlati
  if (relatedProducts.length < 4) {
    const existingIds = [product.id, ...relatedProducts.map((p) => p.id)];
    const fallbackProducts = await prisma.product.findMany({
      where: {
        NOT: { id: { in: existingIds } },
      },
      include: { variants: true },
      take: 4 - relatedProducts.length,
      orderBy: { createdAt: "desc" },
    });
    relatedProducts = [...relatedProducts, ...fallbackProducts];
  }

  const descriptionBlocks = product.descriptionBlocks as unknown as DescriptionBlock[];

  const isDiscountActive = Boolean(
    product.discountPercent &&
      product.discountPercent > 0 &&
      (!product.discountUntil || new Date(product.discountUntil) > new Date())
  );

  // Specifiche: la strip deve adattarsi a 1 o 2 valori, senza lasciare metà vuota
  const specs: { label: string; value: string }[] = [];

  if (product.waterColumn !== null) {
    specs.push({ label: "Colonna d'acqua", value: `${product.waterColumn} MM` });
  }

  if (product.minTemp !== null) {
    specs.push({ label: "Temp. minima", value: `${product.minTemp}°C` });
  }

  return (
    <main className="min-h-screen bg-paper pb-24 text-ink selection:bg-grass selection:text-white sm:pb-32">
      {/* BREADCRUMB */}
      <div className="container-page pt-8 sm:pt-10">
        <nav
          aria-label="Percorso"
          className="flex min-w-0 items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft"
        >
          <Link href="/" className="shrink-0 transition-colors duration-300 hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true" className="text-line">
            /
          </span>
          <Link
            href={`/categoria/${product.category}`}
            className="truncate transition-colors duration-300 hover:text-ink"
          >
            {product.category}
          </Link>
          <span aria-hidden="true" className="text-line">
            /
          </span>
          <span aria-current="page" className="truncate text-ink">
            {product.name}
          </span>
        </nav>
      </div>

      {/* HERO: GALLERIA + PANNELLO ACQUISTO */}
      <div className="container-page mt-8 sm:mt-12">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Galleria: altezza limitata alla viewport, così sticky funziona */}
          <div className="lg:sticky lg:top-[var(--sticky-top)] lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Pannello acquisto */}
          <div className="flex flex-col lg:col-span-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                {product.brand}
              </span>
              {isDiscountActive && (
                <span className="bg-grass px-2 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-white">
                  -{product.discountPercent}%
                </span>
              )}
            </div>

            <h1 className="mt-4 text-[clamp(1.75rem,2.6vw,2.75rem)] font-light leading-[1.08] tracking-tight text-ink">
              {product.name}
            </h1>

            {(product.shortTitle || product.shortDescription) && (
              <div className="mt-6 max-w-[46ch]">
                {product.shortTitle && (
                  <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    {product.shortTitle}
                  </h2>
                )}
                {product.shortDescription && (
                  <p className="text-sm font-light leading-relaxed text-ink-soft sm:text-base">
                    {product.shortDescription}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6">
              <AddToCartButton
                variants={product.variants}
                productSlug={product.slug}
                productName={product.name}
                discountPercent={isDiscountActive ? product.discountPercent : null}
                productImage={product.images[0]}
              />
            </div>

            {/* Trust: righe compatte, non tre colonne */}
            <ul className="mt-10 divide-y divide-line/50 border-t border-line/50">
              <li className="flex items-start gap-3 py-3.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-grass-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                    Testato in Stalla
                  </p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-ink-soft">
                    Resistenza professionale per il campo.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 py-3.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-grass-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                    Reso Facile
                  </p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-ink-soft">
                    30 giorni per cambi o restituzioni.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 py-3.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-grass-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h10v9H3zM13 10h4l3 3v3h-7zM7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                    Spedizione
                  </p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-ink-soft">
                    Gratuita per ordini superiori a 99€.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* SPECS: strip full-bleed, fuori dal pannello acquisto */}
      {specs.length > 0 && (
        <section className="mt-16 border-y border-line/50 bg-paper-warm/60 sm:mt-20">
          <div className="container-page">
            <dl
              className={`grid grid-cols-1 divide-y divide-line/50 ${
                specs.length > 1 ? "sm:grid-cols-2 sm:divide-x sm:divide-y-0" : ""
              }`}
            >
              {specs.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`py-8 sm:py-10 ${
                    specs.length > 1
                      ? index === 0
                        ? "sm:pr-12"
                        : "sm:pl-12"
                      : ""
                  }`}
                >
                  <dt className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    {spec.label}
                  </dt>
                  <dd className="text-2xl font-light tabular-nums tracking-tight text-ink sm:text-3xl">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* DETTAGLI TECNICI: righe numerate, non due colonne di testo */}
      {descriptionBlocks && descriptionBlocks.length > 0 && (
        <section className="container-page pt-20 sm:pt-28">
          <div className="mb-10 sm:mb-14">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
              Specifiche
            </p>
            <h2 className="text-3xl font-light tracking-tight text-ink sm:text-4xl">
              Dettagli tecnici
            </h2>
          </div>

          <dl className="border-t border-line/50">
            {descriptionBlocks.map((block, i) => (
              <Reveal
                key={i}
                as="div"
                delay={Math.min(i, 6) * 60}
                className="grid gap-x-10 gap-y-3 border-b border-line/50 py-8 sm:grid-cols-12 sm:py-10"
              >
                <dt className="flex items-baseline gap-4 sm:col-span-4">
                  <span className="text-[10px] font-semibold tabular-nums tracking-[0.2em] text-ink-soft">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {block.title && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
                      {block.title}
                    </span>
                  )}
                </dt>
                <dd className="max-w-[62ch] text-sm font-light leading-relaxed text-ink-soft sm:col-span-8">
                  {block.text}
                </dd>
              </Reveal>
            ))}
          </dl>
        </section>
      )}

      {/* PRODOTTI CORRELATI */}
      {relatedProducts.length > 0 && (
        <section className="container-page pt-20 sm:pt-28">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:mb-14 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                Esplora
              </p>
              <h2 className="text-3xl font-light tracking-tight text-ink sm:text-4xl">
                Completa l&apos;equipaggiamento
              </h2>
            </div>
            <Link
              href={`/categoria/${product.category}`}
              className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:text-grass-deep"
            >
              Vedi categoria
              <svg
                className="h-3 w-3 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-y-16">
            {relatedProducts.map((relProduct, index) => {
              const minPriceCents =
                relProduct.variants && relProduct.variants.length > 0
                  ? Math.min(...relProduct.variants.map((v) => v.priceCents))
                  : 0;

              const isRelDiscountActive = Boolean(
                relProduct.discountPercent &&
                  relProduct.discountPercent > 0 &&
                  (!relProduct.discountUntil ||
                    new Date(relProduct.discountUntil) > new Date())
              );

              return (
                <Reveal key={relProduct.id} delay={Math.min(index, 3) * 70} className="h-full">
                  <ProductCard
                    name={relProduct.name}
                    slug={relProduct.slug}
                    image={relProduct.images[0]}
                    priceCents={minPriceCents}
                    discountPercent={relProduct.discountPercent}
                    isDiscountActive={isRelDiscountActive}
                    waterColumn={relProduct.waterColumn}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
                  />
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* RECENSIONI */}
      <section className="container-page pt-20 sm:pt-28">
        <ProductReviews productId={product.id} />
      </section>
    </main>
  );
}
