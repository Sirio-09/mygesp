import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

interface ProductsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
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
    <main className="bg-paper min-h-screen pb-20 pt-10 px-4 sm:px-6 lg:px-10 max-w-[1280px] mx-auto">
      <div className="mb-8 border-b border-line pb-6">
        <p className="text-grass-deep text-xs font-bold uppercase tracking-widest mb-1">
          {query ? "Risultati di ricerca" : "Tutti i prodotti"}
        </p>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-ink">
          {query ? `Ricerca per "${query}"` : "Catalogo Prodotti"}
        </h1>
        <p className="text-xs text-ink-soft font-mono mt-2">
          {products.length} prodotti trovati
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-line p-12 text-center">
          <p className="text-ink-soft text-sm font-medium mb-4">
            Nessun prodotto trovato per la tua ricerca.
          </p>
          <Link
            href="/prodotti"
            className="inline-flex items-center text-xs font-bold text-grass-deep uppercase tracking-wider hover:underline"
          >
            ← Mostra tutti i prodotti
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => {
            const minPriceCents =
              product.variants && product.variants.length > 0
                ? Math.min(...product.variants.map((v) => v.priceCents))
                : 0;

            return (
              <Link
                key={product.id}
                href={`/prodotto/${product.slug}`}
                className="bg-white block relative group border border-line hover:border-grass-deep transition-colors duration-200"
              >
                <div className="aspect-square bg-paper-warm/30 relative w-full overflow-hidden border-b border-line/60">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs text-center p-3 font-mono">
                      [nessuna foto]
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white">
                  <h3 className="text-sm font-bold text-ink mb-2 line-clamp-2 group-hover:text-grass-deep transition-colors">
                    {product.name}
                  </h3>
                  <p className="font-mono font-bold text-sm text-grass-deep">
                    €{(minPriceCents / 100).toFixed(2)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}