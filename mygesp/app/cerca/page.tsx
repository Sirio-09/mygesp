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
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-ink">
        Risultati della ricerca per: <span className="italic font-normal">&quot;{query}&quot;</span>
      </h1>

      {products.length === 0 ? (
        <p className="text-ink-soft text-sm">
          Nessun prodotto trovato. Prova a cercare un altro termine.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const mainImage = product.images?.[0] ?? null;

            return (
              <Link
                key={product.id}
                href={`/prodotto/${product.slug}`}
                className="group border border-line p-4 flex flex-col justify-between hover:border-grass transition-colors bg-white"
              >
                <div className="w-full h-48 bg-line/20 relative mb-4 overflow-hidden">
                  {mainImage ? (
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-ink-soft">
                      Nessuna immagine
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-grass-deep tracking-wider block mb-1">
                    {product.brand}
                  </span>
                  <h2 className="text-sm font-bold text-ink group-hover:text-grass-deep transition-colors line-clamp-2">
                    {product.name}
                  </h2>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}