import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function CercaPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const products =
    query.length >= 2
      ? await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { brand: { contains: query, mode: "insensitive" } },
              { shortTitle: { contains: query, mode: "insensitive" } },
              { shortDescription: { contains: query, mode: "insensitive" } },
            ],
          },
          include: {
            variants: true,
          },
        })
      : [];

  return (
    <main className="min-h-[70vh] bg-paper-warm/20">
      <div className="bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <p className="text-xs font-bold text-grass-deep uppercase tracking-widest mb-2">Ricerca Catalogo</p>
          <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight">
            Risultati per: <span className="italic font-normal text-ink-soft">&quot;{query}&quot;</span>
          </h1>
          <p className="text-sm text-ink-soft mt-2">{products.length} {products.length === 1 ? 'prodotto trovato' : 'prodotti trovati'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {products.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-line bg-white rounded-xl max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-paper-warm rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🔍
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Nessun risultato trovato</h3>
            <p className="text-ink-soft text-sm mb-6 max-w-md mx-auto">
              Non siamo riusciti a trovare nulla che corrisponda a "{query}". Prova a controllare l'ortografia o usa termini più generici.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/shop" className="bg-grass hover:bg-grass-deep text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-md transition-colors">
                Esplora lo Shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => {
              const mainImage = product.images?.[0] ?? null;
              // Calcolo prezzo (se disponibile nelle varianti)
              const price = product.variants?.[0]?.priceCents 
                ? `€${(product.variants[0].priceCents / 100).toFixed(2)}` 
                : null;

              return (
                <Link
                  key={product.id}
                  href={`/prodotto/${product.slug}`}
                  className="group bg-white border border-line rounded-xl overflow-hidden hover:border-grass hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="w-full aspect-[4/5] bg-paper-warm relative overflow-hidden">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-ink-soft font-medium">
                        Nessuna immagine
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-black text-grass-deep tracking-widest block mb-1">
                        {product.brand}
                      </span>
                      <h2 className="text-sm font-bold text-ink leading-snug group-hover:text-grass transition-colors line-clamp-2">
                        {product.name}
                      </h2>
                    </div>
                    {price && (
                      <div className="text-sm font-black text-ink pt-3 border-t border-line/50">
                        {price}
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