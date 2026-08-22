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

  return (
    <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <Link href="/" className="text-sm text-ink-soft hover:text-grass-deep mb-6 inline-block">
        ← Torna al catalogo
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <div className="text-grass-deep text-xs font-bold uppercase tracking-wide mb-2">
            {product.brand}
          </div>
          <h1 className="text-ink font-extrabold text-2xl sm:text-3xl mb-4">
            {product.name}
          </h1>

          <div className="space-y-4 mb-6">
            {descriptionBlocks?.map((block, i) => (
              <div key={i}>
                {block.title && <h3 className="text-ink font-bold text-sm mb-1">{block.title}</h3>}
                <p className="text-ink-soft text-sm">{block.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 mb-6">
            {product.waterColumn && (
              <div className="bg-paper-warm border border-dashed border-line py-3 px-4">
                <div className="text-[10px] tracking-wide text-ink-soft uppercase mb-1">
                  Colonna d&apos;acqua
                </div>
                <div className="text-lg font-bold text-soil-deep">
                  {product.waterColumn}mm
                </div>
              </div>
            )}
            {product.minTemp && (
              <div className="bg-paper-warm border border-dashed border-line py-3 px-4">
                <div className="text-[10px] tracking-wide text-ink-soft uppercase mb-1">
                  Temperatura minima
                </div>
                <div className="text-lg font-bold text-soil-deep">
                  {product.minTemp}°C
                </div>
              </div>
            )}
          </div>

          <AddToCartButton
            variants={product.variants}
            productSlug={product.slug}
            productName={product.name}
          />

          <div className="mt-8 pt-6 border-t border-dashed border-line text-sm text-ink-soft space-y-2">
            <p>✓ Testato in stalla e al pascolo</p>
            <p>✓ Reso gratuito entro 30 giorni</p>
            <p>✓ Spedizione gratuita sopra i 99€</p>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </main>
  );
}