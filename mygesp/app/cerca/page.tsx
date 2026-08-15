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
    <main className="max-w-[1200px] mx-auto px-8 py-12">
      <Link href="/" className="text-sm text-mud hover:text-rust mb-6 inline-block">
        ← Torna alla home
      </Link>
      <div className="mb-10">
        <div className="text-rust text-xs tracking-[0.1em] uppercase mb-2 font-semibold">
          Risultati ricerca
        </div>
        <h1 className="font-display text-3xl uppercase text-loden-deep tracking-wide">
          &ldquo;{query}&rdquo;
        </h1>
      </div>

      {products.length === 0 ? (
        <div className="border border-dashed border-mud py-16 text-center">
          <p className="text-slate">Nessun prodotto trovato per questa ricerca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/prodotto/${product.slug}`}
              className="bg-white border border-canvas-deep relative block hover:border-rust transition-colors"
            >
              <div className="aspect-square bg-[#DCD4BF] flex items-center justify-center text-[11px] text-mud text-center p-4 relative overflow-hidden">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                ) : (
                  <span>[nessuna foto]</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-loden-deep mb-2 leading-tight">{product.name}</h3>
                {product.variants[0] && (
                  <span className="font-mono font-medium text-base text-rust-deep">
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