import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const CATEGORIE: Record<string, string> = {
  abbigliamento: "Abbigliamento impermeabile",
  stivali: "Stivali e calzature",
  attrezzature: "Attrezzature e accessori",
};

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const titolo = CATEGORIE[slug];
  if (!titolo) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: { category: slug },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-12">
      <Link href="/" className="text-sm text-mud hover:text-rust mb-6 inline-block">
        ← Torna alla home
      </Link>

      <div className="mb-10">
        <div className="text-rust text-xs tracking-[0.1em] uppercase mb-2 font-semibold">
          Categoria
        </div>
        <h1 className="font-display text-3xl uppercase text-loden-deep tracking-wide font-bold">
          {titolo}
        </h1>
      </div>

      {products.length === 0 ? (
        <div className="border border-dashed border-mud py-16 text-center">
          <p className="text-slate">Nessun prodotto disponibile in questa categoria al momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
          {products.map((product) => {
            const isDiscountActive = Boolean(
              product.discountPercent &&
                product.discountPercent > 0 &&
                (!product.discountUntil || new Date(product.discountUntil) > new Date())
            );

            const minPriceCents =
              product.variants && product.variants.length > 0
                ? Math.min(...product.variants.map((v) => v.priceCents))
                : 0;

            const discountedPriceCents = isDiscountActive
              ? Math.round((minPriceCents * (100 - product.discountPercent!)) / 100)
              : minPriceCents;

            return (
              <Link
                key={product.id}
                href={`/prodotto/${product.slug}`}
                className="bg-white block relative hover:opacity-95 transition-opacity"
              >
                {/* Immagine riempita come nella Prima Immagine (object-cover) */}
                <div className="aspect-square bg-white relative w-full overflow-hidden">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[11px] text-mud">
                      [nessuna foto]
                    </div>
                  )}

                  {/* Badge Sconto (Rettangolo marrone pieno) */}
                  {isDiscountActive && (
                    <span className="absolute top-2 left-2 bg-rust text-white text-xs font-bold px-2 py-1 z-10">
                      -{product.discountPercent}%
                    </span>
                  )}

                  {/* Badge Colonna d'Acqua */}
                  {product.waterColumn && (
                    <span className="absolute top-2 right-2 bg-loden text-canvas font-mono text-[10px] py-1 px-2 z-10">
                      {product.waterColumn}MM
                    </span>
                  )}
                </div>

                {/* Dettagli Prodotto */}
                <div className="p-4 bg-white">
                  <h3 className="text-sm font-bold text-loden-deep mb-3 leading-tight">
                    {product.name}
                  </h3>

                  {product.variants.length > 0 && (
                    <div className="flex items-baseline gap-2 font-mono">
                      {isDiscountActive ? (
                        <>
                          {/* Prezzo Scontato Marrone */}
                          <span className="font-bold text-base text-rust">
                            €{(discountedPriceCents / 100).toFixed(2)}
                          </span>
                          {/* Prezzo Originale Sbarrato */}
                          <span className="text-xs text-mud line-through">
                            €{(minPriceCents / 100).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-base text-rust">
                          €{(minPriceCents / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}