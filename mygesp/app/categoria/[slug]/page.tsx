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
    <div className="bg-[#F5F2EB] min-h-screen py-12">
      <main className="max-w-[1200px] mx-auto px-8">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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
                /* Card con contorno leggero e transizione al passaggio del mouse */
                <Link
                  key={product.id}
                  href={`/prodotto/${product.slug}`}
                  className="bg-white block relative overflow-hidden group border border-[#E5E0D8] hover:border-[#80532b]/60 transition-colors"
                >
                  {/* Proporzione quadrata per ridurre l'altezza della card */}
                  <div className="aspect-square bg-white relative w-full overflow-hidden">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[11px] text-mud">
                        [nessuna foto]
                      </div>
                    )}

                    {/* Badge Sconto marrone */}
                    {isDiscountActive && (
                      <span className="absolute top-2.5 left-2.5 bg-[#80532b] text-white text-xs font-bold px-2 py-1 z-10">
                        -{product.discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Dettagli prodotto compatti */}
                  <div className="p-4 bg-white">
                    <h3 className="text-sm font-bold text-[#1F2925] mb-2 leading-snug line-clamp-2">
                      {product.name}
                    </h3>

                    {product.variants.length > 0 && (
                      <div className="flex items-baseline gap-2 font-mono">
                        {isDiscountActive ? (
                          <>
                            <span className="font-bold text-base text-[#80532b]">
                              €{(discountedPriceCents / 100).toFixed(2)}
                            </span>
                            <span className="text-xs text-[#7A7A7A] line-through">
                              €{(minPriceCents / 100).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-base text-[#80532b]">
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
    </div>
  );
}