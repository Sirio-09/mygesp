import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductGallery from "@/components/product/ProductGallery";
import ProductReviews from "@/components/product/ProductReviews";
import BackButton from "@/components/product/BackButton";

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

  return (
    <main className="bg-paper min-h-screen pb-24 sm:pb-32 text-ink selection:bg-grass selection:text-white">
      {/* HEADER SPAZIOSO CON BACK BUTTON */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 mb-8">
        <BackButton />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="space-y-24 sm:space-y-32">
          
          {/* SEZIONE PRINCIPALE PRODOTTO */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* Galleria Immagini */}
            <div className="lg:col-span-7 lg:sticky lg:top-24">
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* Informazioni e Acquisto */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex items-center gap-4 mb-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                  {product.brand}
                </span>
                {isDiscountActive && (
                  <span className="bg-grass text-white text-[10px] font-medium px-2 py-1 uppercase tracking-widest">
                    -{product.discountPercent}%
                  </span>
                )}
              </div>

              <h1 className="text-ink font-light text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-8 leading-[1.1]">
                {product.name}
              </h1>

              {(product.shortTitle || product.shortDescription) && (
                <div className="mb-10">
                  {product.shortTitle && (
                    <h2 className="text-ink font-medium text-sm uppercase tracking-wider mb-3">
                      {product.shortTitle}
                    </h2>
                  )}
                  {product.shortDescription && (
                    <p className="text-ink-soft text-base font-light leading-relaxed">
                      {product.shortDescription}
                    </p>
                  )}
                </div>
              )}

              {(product.waterColumn || product.minTemp) && (
                <div className="flex flex-wrap gap-10 py-6 border-y border-line/40 mb-10">
                  {product.waterColumn && (
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-widest text-ink-soft mb-1">
                        Colonna d&apos;acqua
                      </div>
                      <div className="text-lg font-light text-ink">
                        {product.waterColumn} MM
                      </div>
                    </div>
                  )}
                  {product.minTemp && (
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-widest text-ink-soft mb-1">
                        Temp. minima
                      </div>
                      <div className="text-lg font-light text-ink">
                        {product.minTemp}°C
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-12">
                <AddToCartButton
                  variants={product.variants}
                  productSlug={product.slug}
                  productName={product.name}
                  discountPercent={isDiscountActive ? product.discountPercent : null}
                  productImage={product.images[0]}
                />
              </div>

              {/* Trust Badges - Minimalisti */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-line/40">
                <div>
                  <p className="text-ink font-medium text-[11px] mb-1.5 uppercase tracking-widest">
                    Testato in Stalla
                  </p>
                  <p className="text-ink-soft text-xs font-light leading-relaxed">
                    Resistenza professionale per il campo.
                  </p>
                </div>
                <div>
                  <p className="text-ink font-medium text-[11px] mb-1.5 uppercase tracking-widest">
                    Reso Facile
                  </p>
                  <p className="text-ink-soft text-xs font-light leading-relaxed">
                    30 giorni per cambi o restituzioni.
                  </p>
                </div>
                <div>
                  <p className="text-ink font-medium text-[11px] mb-1.5 uppercase tracking-widest">
                    Spedizione
                  </p>
                  <p className="text-ink-soft text-xs font-light leading-relaxed">
                    Gratuita per ordini superiori a 99€.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DETTAGLI TECNICI */}
          {descriptionBlocks && descriptionBlocks.length > 0 && (
            <section className="pt-24 border-t border-line/40">
              <div className="mb-12 md:mb-16">
                <p className="text-ink-soft text-[10px] font-semibold uppercase tracking-[0.2em] mb-4">
                  Specifiche
                </p>
                <h2 className="text-ink font-light text-3xl sm:text-4xl tracking-tight">
                  Dettagli tecnici
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                {descriptionBlocks.map((block, i) => (
                  <div key={i}>
                    {block.title && (
                      <h3 className="text-ink font-medium text-sm uppercase tracking-wider mb-4">
                        {block.title}
                      </h3>
                    )}
                    <p className="text-ink-soft text-sm font-light leading-relaxed">
                      {block.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PRODOTTI CORRELATI - Stile coerente con CategoryPage */}
          {relatedProducts.length > 0 && (
            <section className="pt-24 border-t border-line/40">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <p className="text-ink-soft text-[10px] font-semibold uppercase tracking-[0.2em] mb-4">
                    Esplora
                  </p>
                  <h2 className="text-ink font-light text-3xl sm:text-4xl tracking-tight">
                    Completa l&apos;equipaggiamento
                  </h2>
                </div>
                <Link
                  href={`/categoria/${product.category}`}
                  className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink hover:text-grass transition-colors"
                >
                  Vedi categoria &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
                {relatedProducts.map((relProduct) => {
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

                  const discountedPriceCents = isRelDiscountActive
                    ? Math.round(
                        (minPriceCents * (100 - relProduct.discountPercent!)) / 100
                      )
                    : minPriceCents;

                  const formattedPrice = (discountedPriceCents / 100).toFixed(2);
                  const formattedFullPrice = (minPriceCents / 100).toFixed(2);

                  return (
                    <Link
                      key={relProduct.id}
                      href={`/prodotto/${relProduct.slug}`}
                      className="group flex flex-col"
                    >
                      <div className="aspect-[4/5] bg-paper relative w-full overflow-hidden mb-5">
                        {relProduct.images[0] ? (
                          <Image
                            src={relProduct.images[0]}
                            alt={relProduct.name}
                            fill
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs uppercase tracking-widest font-light bg-line/10">
                            Nessuna immagine
                          </div>
                        )}

                        {isRelDiscountActive && (
                          <span className="absolute top-4 left-4 bg-grass text-white text-[10px] sm:text-xs font-medium px-3 py-1.5 uppercase tracking-widest">
                            -{relProduct.discountPercent}%
                          </span>
                        )}
                        
                        {relProduct.waterColumn && (
                          <span className="absolute top-4 right-4 bg-ink/90 text-white text-[10px] font-medium px-2 py-1 uppercase tracking-widest backdrop-blur-sm">
                            {relProduct.waterColumn}MM
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col flex-grow">
                        <h3 className="text-sm font-medium text-ink mb-2 leading-snug group-hover:text-grass transition-colors">
                          {relProduct.name}
                        </h3>

                        {relProduct.variants.length > 0 && (
                          <div className="mt-auto pt-2 flex items-baseline gap-3">
                            {isRelDiscountActive ? (
                              <>
                                <span className="font-medium text-sm text-grass">
                                  €{formattedPrice}
                                </span>
                                <span className="text-xs text-ink-soft line-through">
                                  €{formattedFullPrice}
                                </span>
                              </>
                            ) : (
                              <span className="font-medium text-sm text-ink-soft">
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
            </section>
          )}

          {/* RECENSIONI */}
          <section className="pt-24 border-t border-line/40">
            <ProductReviews productId={product.id} />
          </section>
          
        </div>
      </div>
    </main>
  );
}