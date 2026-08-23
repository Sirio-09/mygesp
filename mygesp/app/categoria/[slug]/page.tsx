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
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Pulsante Indietro */}
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-mud hover:text-rust transition-colors mb-8 group"
      >
        <span className="mr-1.5 transition-transform group-hover:-translate-x-1">←</span>
        Torna alla home
      </Link>

      {/* Intestazione Sezione */}
      <div className="mb-10 pb-4 border-b border-canvas-deep/40">
        <span className="text-rust text-xs tracking-[0.15em] uppercase font-bold block mb-1">
          Categoria
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-loden-deep tracking-wide font-bold">
          {titolo}
        </h1>
      </div>

      {/* Griglia Prodotti */}
      {products.length === 0 ? (
        <div className="border border-dashed border-mud/40 rounded-lg py-20 text-center bg-white/40">
          <p className="text-mud text-base">Nessun prodotto disponibile in questa categoria al momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {products.map((product) => {
            // Calcolo Sconto
            const isDiscountActive = Boolean(
              product.discountPercent &&
                product.discountPercent > 0 &&
                (!product.discountUntil || new Date(product.discountUntil) > new Date())
            );

            // Prezzo Minimo
            const minPriceCents =
              product.variants && product.variants.length > 0
                ? Math.min(...product.variants.map((v) => v.priceCents))
                : 0;

            // Prezzo Finale Scontato
            const discountedPriceCents = isDiscountActive
              ? Math.round((minPriceCents * (100 - product.discountPercent!)) / 100)
              : minPriceCents;

            return (
              <Link
                key={product.id}
                href={`/prodotto/${product.slug}`}
                className="group bg-white border border-canvas-deep flex flex-col justify-between hover:border-rust hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Immagine con Sfondo Bianco Pulito */}
                  <div className="aspect-square bg-white relative w-full overflow-hidden p-3 flex items-center justify-center">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-contain p-2 group-hover:scale-102 transition-transform duration-300 ease-out"
                      />
                    ) : (
                      <span className="text-xs text-mud font-mono">[nessuna foto]</span>
                    )}

                    {/* Badge Sconto (Pieno e visibile come Immagine 2) */}
                    {isDiscountActive && (
                      <span className="absolute top-2.5 left-2.5 bg-rust text-white text-xs font-bold px-2 py-1 z-10 tracking-tight">
                        -{product.discountPercent}%
                      </span>
                    )}

                    {/* Badge Impermeabilità */}
                    {product.waterColumn && (
                      <span className="absolute top-2.5 right-2.5 bg-loden text-canvas font-mono text-[10px] px-1.5 py-0.5 z-10">
                        {product.waterColumn}MM
                      </span>
                    )}
                  </div>

                  {/* Nome Prodotto */}
                  <div className="p-4 pt-2">
                    <h3 className="text-sm font-bold text-loden-deep leading-snug line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {/* Prezzi */}
                {product.variants.length > 0 && (
                  <div className="p-4 pt-0">
                    <div className="flex items-baseline gap-2 font-mono">
                      {isDiscountActive ? (
                        <>
                          <span className="font-bold text-base text-rust">
                            €{(discountedPriceCents / 100).toFixed(2)}
                          </span>
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
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}