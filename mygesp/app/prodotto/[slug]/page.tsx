import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/product/AddToCartButton";
import Link from "next/link";

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

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-12">
      <Link href="/" className="text-sm text-mud hover:text-rust mb-6 inline-block">
        ← Torna al catalogo
      </Link>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-[#DCD4BF] flex items-center justify-center text-[13px] text-mud text-center p-8 relative overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <span>[nessuna foto]</span>
          )}
        </div>

        <div>
          <div className="text-rust text-xs tracking-[0.1em] uppercase mb-2 font-semibold">
            {product.brand}
          </div>
          <h1 className="font-display text-3xl uppercase text-loden-deep tracking-wide mb-4">
            {product.name}
          </h1>
          <p className="text-slate mb-6">{product.description}</p>

          <div className="flex gap-4 mb-6">
            {product.waterColumn && (
              <div className="bg-white border border-dashed border-mud py-3 px-4">
                <div className="text-[10px] tracking-wide text-slate uppercase mb-1">
                  Colonna d&apos;acqua
                </div>
                <div className="font-mono text-lg font-medium text-rust-deep">
                  {product.waterColumn}mm
                </div>
              </div>
            )}
            {product.minTemp && (
              <div className="bg-white border border-dashed border-mud py-3 px-4">
                <div className="text-[10px] tracking-wide text-slate uppercase mb-1">
                  Temperatura minima
                </div>
                <div className="font-mono text-lg font-medium text-rust-deep">
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

          <div className="mt-8 pt-6 border-t border-dashed border-mud text-sm text-slate space-y-2">
            <p>✓ Testato in stalla e al pascolo</p>
            <p>✓ Reso gratuito entro 30 giorni</p>
            <p>✓ Spedizione gratuita sopra i 99€</p>
          </div>
        </div>
      </div>
    </main>
  );
}