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
    <main className="bg-paper min-h-screen pb-20 sm:pb-28">
      {/* Contenitore Principale */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 space-y-10 sm:space-y-12">
        {/* Pulsante Indietro Stile Boxed */}
        <div>
          <BackButton />
        </div>

        {/* Grid Principale Prodotto */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Galleria Immagini */}
          <div className="lg:col-span-7 lg:sticky lg:top-20">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Informazioni e Acquisto */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-line">
              <span className="text-grass-deep text-xs font-bold uppercase tracking-widest">
                {product.brand}
              </span>
              {isDiscountActive && (
                <span className="bg-grass-deep text-white text-xs font-extrabold px-3 py-1 rounded shadow-md tracking-wide">
                  -{product.discountPercent}% SCONTO
                </span>
              )}
            </div>

            <h1 className="text-ink font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight">
              {product.name}
            </h1>

            {(product.shortTitle || product.shortDescription) && (
              <div className="p-4 bg-white border border-line space-y-1.5">
                {product.shortTitle && (
                  <p className="text-ink font-bold text-xs uppercase tracking-wider">
                    {product.shortTitle}
                  </p>
                )}
                {product.shortDescription && (
                  <p className="text-ink-soft text-sm leading-relaxed">
                    {product.shortDescription}
                  </p>
                )}
              </div>
            )}

            {(product.waterColumn || product.minTemp) && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-paper-warm/40 border border-line">
                {product.waterColumn && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                      Colonna d&apos;acqua
                    </div>
                    <div className="text-lg font-mono font-bold text-ink">
                      {product.waterColumn} MM
                    </div>
                  </div>
                )}
                {product.minTemp && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                      Temperatura minima
                    </div>
                    <div className="text-lg font-mono font-bold text-ink">
                      {product.minTemp}°C
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <AddToCartButton
                variants={product.variants}
                productSlug={product.slug}
                productName={product.name}
                discountPercent={isDiscountActive ? product.discountPercent : null}
                productImage={product.images[0]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-line">
              <div className="bg-paper-warm/40 p-3.5 border border-line">
                <p className="text-ink font-bold text-xs mb-0.5">Testato in Stalla</p>
                <p className="text-ink-soft text-[11px]">Resistenza professionale sul campo</p>
              </div>
              <div className="bg-paper-warm/40 p-3.5 border border-line">
                <p className="text-ink font-bold text-xs mb-0.5">Reso Facile</p>
                <p className="text-ink-soft text-[11px]">30 giorni di tempo per il reso</p>
              </div>
              <div className="bg-paper-warm/40 p-3.5 border border-line">
                <p className="text-ink font-bold text-xs mb-0.5">Spedizione Rapida</p>
                <p className="text-ink-soft text-[11px]">Gratuita per ordini sopra i 99€</p>
              </div>
            </div>
          </div>
        </div>

        {/* Descrizioni Estese */}
        {descriptionBlocks && descriptionBlocks.length > 0 && (
          <section className="pt-12 border-t border-line space-y-6">
            <div className="max-w-2xl">
              <p className="text-grass-deep text-xs font-bold uppercase tracking-widest mb-1">
                Specifiche di dettaglio
              </p>
              <h2 className="text-ink font-extrabold text-2xl tracking-tight uppercase">
                Descrizione Prodotto
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {descriptionBlocks.map((block, i) => (
                <div key={i} className="p-5 bg-white border border-line space-y-2">
                  {block.title && (
                    <h3 className="text-ink font-bold text-xs uppercase tracking-wider">
                      {block.title}
                    </h3>
                  )}
                  <p className="text-ink-soft text-sm leading-relaxed">{block.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prodotti Correlati */}
        {relatedProducts.length > 0 && (
          <section className="pt-12 border-t border-line space-y-6">
            <div className="max-w-2xl">
              <p className="text-grass-deep text-xs font-bold uppercase tracking-widest mb-1">
                Completa l&apos;equipaggiamento
              </p>
              <h2 className="text-ink font-extrabold text-2xl tracking-tight uppercase">
                Prodotti Correlati
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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

                const finalMinPriceCents =
                  isRelDiscountActive && relProduct.discountPercent
                    ? Math.round(minPriceCents * (1 - relProduct.discountPercent / 100))
                    : minPriceCents;

                return (
                  <Link
                    key={relProduct.id}
                    href={`/prodotto/${relProduct.slug}`}
                    className="bg-white block relative group border border-line hover:border-grass-deep transition-colors duration-200"
                  >
                    <div className="aspect-square bg-paper-warm/30 relative w-full overflow-hidden border-b border-line/60">
                      {relProduct.images[0] ? (
                        <Image
                          src={relProduct.images[0]}
                          alt={relProduct.name}
                          fill
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs text-center p-3 font-mono">
                          [nessuna foto]
                        </div>
                      )}

                      {isRelDiscountActive && (
                        <span className="absolute top-2 right-2 bg-grass-deep text-white text-[10px] font-extrabold px-2 py-0.5 shadow-md">
                          -{relProduct.discountPercent}%
                        </span>
                      )}
                    </div>

                    <div className="p-4 bg-white">
                      <p className="text-[10px] font-bold uppercase text-grass-deep tracking-wider mb-1">
                        {relProduct.brand}
                      </p>
                      <h3 className="text-xs font-bold text-ink mb-2 line-clamp-2 group-hover:text-grass-deep transition-colors">
                        {relProduct.name}
                      </h3>

                      <div className="flex items-baseline gap-2">
                        <p className="font-mono font-bold text-sm text-grass-deep">
                          €{(finalMinPriceCents / 100).toFixed(2)}
                        </p>
                        {isRelDiscountActive && (
                          <p className="font-mono text-xs text-ink-soft line-through">
                            €{(minPriceCents / 100).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Recensioni */}
        <div className="border-line">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </main>
  );
}