import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

export default async function CercaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const products = query.length >= 2
    ? await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { variants: true },
      })
    : [];

  return (
    <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <Link href="/" className="text-sm text-ink-soft hover:text-grass-deep mb-6 inline-block">
        ← Torna alla home
      </Link>
      <div className="mb-8 sm:mb-10">
        <div className="text-grass-deep text-xs font-bold uppercase tracking-wide mb-2">
          Risultati ricerca
        </div>
        <h1 className="text-ink font-extrabold text-2xl sm:text-3xl">
          &ldquo;{query}&rdquo;
        </h1>
      </div>

      {products.length === 0 ? (
        <div className="border border-dashed border-line py-16 text-center">
          <p className="text-ink-soft">Nessun prodotto trovato per questa ricerca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/prodotto/${product.slug}`}
              className="bg-white border border-line hover:border-grass-deep hover:shadow-md transition-all"
            >
              <div className="aspect-square bg-line/30 relative overflow-hidden">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                ) : (
                  <span className="text-ink-soft text-xs">[nessuna foto]</span>
                )}
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="text-ink text-sm font-semibold mb-1.5 leading-tight">{product.name}</h3>
                {product.variants[0] && (
                  <span className="text-soil-deep font-bold text-sm">
                    €{(product.variants[0].priceCents / 100).toFixed(2)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}