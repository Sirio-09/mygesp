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
  const firstText = blocks?.[0]?.text ?? product.name;

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

  // Lo sconto è attivo se è > 0 e se la data non c'è oppure è futura
  const isDiscountActive = Boolean(
    product.discountPercent &&
    product.discountPercent > 0 &&
    (!product.discountUntil || new Date(product.discountUntil) > new Date())
  );

  return (
    <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-12">
      {/* Breadcrumb / Pulsante Ritorno */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-soft hover:text-grass-deep transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Torna al catalogo</span>
        </Link>
      </div>

      {/* Grid Principale Prodotto */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Galleria Immagini (Sinistra) */}
        <div className="lg:col-span-7 sticky top-20">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Informazioni e Acquisto (Destra) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Marca e Sconto */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-line">
            <span className="text-grass-deep text-xs font-black uppercase tracking-widest bg-grass/10 px-3 py-1 rounded-md">
              {product.brand}
            </span>
            {isDiscountActive && (
              <span className="bg-soil-deep text-white text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                -{product.discountPercent}% Sconto
              </span>
            )}
          </div>

          {/* Titolo Prodotto */}
          <h1 className="text-ink font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight uppercase leading-tight">
            {product.name}
          </h1>

          {/* Specifiche Tecniche (Colonna d'Acqua & Temperatura) */}
          {(product.waterColumn || product.minTemp) && (
            <div className="grid grid-cols-2 gap-3 p-4 bg-paper-warm border border-line rounded-xl">
              {product.waterColumn && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                    Colonna d&apos;acqua
                  </div>
                  <div className="text-xl font-black text-soil-deep">
                    {product.waterColumn} mm
                  </div>
                </div>
              )}
              {product.minTemp && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                    Temperatura minima
                  </div>
                  <div className="text-xl font-black text-soil-deep">
                    {product.minTemp}°C
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Blocchi Descrittivi */}
          {descriptionBlocks && descriptionBlocks.length > 0 && (
            <div className="p-4 bg-paper rounded-xl border border-line shadow-xs space-y-3">
              {descriptionBlocks.map((block, i) => (
                <div key={i} className={i > 0 ? "pt-3 border-t border-line/60" : ""}>
                  {block.title && (
                    <h3 className="text-ink font-bold text-xs uppercase tracking-wide mb-1">
                      {block.title}
                    </h3>
                  )}
                  <p className="text-ink-soft text-sm leading-relaxed">{block.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Bottone d'Acquisto */}
          <div className="pt-2">
            <AddToCartButton
              variants={product.variants}
              productSlug={product.slug}
              productName={product.name}
              discountPercent={isDiscountActive ? product.discountPercent : null}
            />
          </div>

          {/* Vantaggi / Garanzie */}
          <div className="p-4 bg-paper-warm/60 border border-line rounded-xl text-xs font-semibold text-ink space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-grass/20 text-grass-deep flex items-center justify-center text-xs font-bold shrink-0">
                ✓
              </span>
              <span>Testato sul campo in stalla e al pascolo</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-grass/20 text-grass-deep flex items-center justify-center text-xs font-bold shrink-0">
                ✓
              </span>
              <span>Reso gratuito e garantito entro 30 giorni</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-grass/20 text-grass-deep flex items-center justify-center text-xs font-bold shrink-0">
                ✓
              </span>
              <span>Spedizione gratuita sopra i 99€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recensioni in Basso */}
      <div className="pt-10 border-t border-line">
        <ProductReviews productId={product.id} />
      </div>
    </main>
  );
}