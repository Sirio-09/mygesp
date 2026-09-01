import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

interface ProductsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const whereCondition = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { brand: { contains: query, mode: "insensitive" as const } },
          { shortTitle: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const products = await prisma.product.findMany({
    where: whereCondition,
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-paper-warm/20">
      <div className="bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <p className="text-grass-deep text-xs font-bold uppercase tracking-widest mb-2">
            {query ? "Risultati di ricerca" : "La nostra selezione"}
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-ink tracking-tight">
            {query ? `Ricerca per "${query}"` : "Catalogo Prodotti"}
          </h1>
          <p className="text-sm text-ink-soft mt-3 font-medium">
            {products.length} {products.length === 1 ? 'prodotto disponibile' : 'prodotti disponibili'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-dashed border-line rounded-xl max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-paper-warm text-ink-soft rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🍃
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Nessun prodotto trovato</h3>
            <p className="text-ink-soft text-sm mb-6">
              Non abbiamo trovato nulla per la tua ricerca. Esplora le altre categorie.
            </p>
            <Link
              href="/prodotti"
              className="inline-block bg-grass hover:bg-grass-deep text-white font-bold text-xs uppercase tracking-wider py-3 px-8 rounded-md transition-colors"
            >
              Mostra tutto il catalogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => {
              const minPriceCents = product.variants?.length > 0
                ? Math.min(...product.variants.map((v) => v.priceCents))
                : 0;

              return (
                <Link
                  key={product.id}
                  href={`/prodotto/${product.slug}`}
                  className="group bg-white border border-line rounded-xl overflow-hidden hover:border-grass hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="w-full aspect-[4/5] bg-paper-warm relative overflow-hidden">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-ink-soft font-medium uppercase tracking-widest">
                        Nessuna foto
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      {product.brand && (
                        <span className="text-[10px] uppercase font-black text-grass-deep tracking-widest block mb-1">
                          {product.brand}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-ink leading-snug group-hover:text-grass transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </div>
                    {minPriceCents > 0 && (
                      <div className="text-sm font-black text-ink pt-3 border-t border-line/50">
                        €{(minPriceCents / 100).toFixed(2)}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}