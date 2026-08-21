import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/layout/LogoutButton";

export default async function AdminHome() {
  const session = await auth();

  if (!session || (session.user as { role?: string })?.role !== "admin") {
    redirect("/admin/login");
  }

  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  const totalStock = products.reduce(
    (sum, p) => sum + p.variants.reduce((s, v) => s + v.stock, 0),
    0
  );

  return (
    <main className="max-w-[1000px] mx-auto px-4 sm:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="text-grass-deep text-xs tracking-wide uppercase mb-1 font-bold">
            Area tecnica
          </div>
          <h1 className="text-ink font-extrabold text-3xl">
            Catalogo prodotti
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/admin/utenti" className="text-ink-soft hover:text-grass-deep text-sm">
            Staff
          </Link>
          <LogoutButton />
          <Link
            href="/admin/nuovo-prodotto"
            className="bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3 px-5 transition-colors"
          >
            + Nuovo prodotto
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-10">
        <div className="bg-paper-warm border border-dashed border-line py-3 px-4">
          <div className="text-[10px] tracking-wide text-ink-soft uppercase mb-1">Prodotti a catalogo</div>
          <div className="text-xl font-bold text-soil-deep">{products.length}</div>
        </div>
        <div className="bg-paper-warm border border-dashed border-line py-3 px-4">
          <div className="text-[10px] tracking-wide text-ink-soft uppercase mb-1">Pezzi in magazzino</div>
          <div className="text-xl font-bold text-soil-deep">{totalStock}</div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="border border-dashed border-line py-16 text-center">
          <p className="text-ink-soft mb-4">Nessun prodotto ancora a catalogo.</p>
          <Link href="/admin/nuovo-prodotto" className="text-grass-deep hover:underline text-sm">
            Aggiungi il primo prodotto →
          </Link>
        </div>
      ) : (
        <div className="border-t border-line">
          {products.map((product) => {
            const stock = product.variants.reduce((s, v) => s + v.stock, 0);
            return (
              <Link
                key={product.id}
                href={`/admin/prodotti/${product.id}`}
                className="flex items-center gap-4 py-3 border-b border-line hover:bg-paper-warm transition-colors px-2 -mx-2"
              >
                <div className="w-14 h-14 bg-line/40 flex-shrink-0 relative overflow-hidden">
                  {product.images[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-ink-soft">
                      no foto
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{product.name}</p>
                  <p className="text-xs text-ink-soft">{product.brand} · {product.variants.length} taglie</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-soil-deep">
                    €{product.variants[0] ? (product.variants[0].priceCents / 100).toFixed(2) : "—"}
                  </p>
                  <p className={`text-xs ${stock === 0 ? "text-soil-deep" : "text-ink-soft"}`}>
                    {stock === 0 ? "esaurito" : `${stock} pz`}
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