import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductGallery from "@/components/product/ProductGallery";
import ProductReviews from "@/components/product/ProductReviews";

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

  const descriptionBlocks = product.descriptionBlocks as unknown as DescriptionBlock[];

  const isDiscountActive = Boolean(
    product.discountPercent &&
    product.discountPercent > 0 &&
    (!product.discountUntil || new Date(product.discountUntil) > new Date())
  );

  return (
    <main className="bg-paper min-h-screen pb-20 sm:pb-28">
      {/* Header / Breadcrumb Minimalista */}
      <div className="bg-paper-warm/40 border-b border-line py-4">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-soft hover:text-grass-deep transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Torna al catalogo</span>
          </Link>
        </div>
      </div>

      {/* Grid Principale Prodotto */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 space-y-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Galleria Immagini (Sinistra) */}
          <div className="lg:col-span-7 sticky top-20">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Informazioni e Acquisto (Destra) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header Marca e Sconto */}
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

            {/* Titolo Prodotto */}
            <h1 className="text-ink font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Titolo Breve e Descrizione Breve (Affiancati/Sopra il box d'acquisto) */}
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

            {/* Specifiche Tecniche (Colonna d'Acqua & Temperatura) */}
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

            {/* Bottone d'Acquisto */}
            <div className="pt-2">
              <AddToCartButton
                variants={product.variants}
                productSlug={product.slug}
                productName={product.name}
                discountPercent={isDiscountActive ? product.discountPercent : null}
                productImage={product.images[0]} // ✅ ECCO LA RIGA MAGICA
              />
            </div>
            
            {/* Vantaggi / Garanzie */}
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

        {/* Sezione Descrizioni Estese (Sotto la foto/box d'acquisto e prima delle recensioni) */}
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

        {/* Recensioni in Basso */}
        <div className="pt-12 border-t border-line">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </main>
  );
}