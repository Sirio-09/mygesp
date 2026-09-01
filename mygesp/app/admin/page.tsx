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

  const totalOrders = await prisma.order.count();

  const totalStock = products.reduce(
    (sum, p) => sum + p.variants.reduce((s, v) => s + v.stock, 0),
    0
  );

  const outOfStockCount = products.filter(
    (p) => p.variants.reduce((s, v) => s + v.stock, 0) === 0
  ).length;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-ink">
      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
            Area Tecnica
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Pannello Admin
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/ordini"
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-white hover:bg-paper-warm transition-colors"
          >
            Ordini
          </Link>
          <Link
            href="/admin/utenti"
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-white hover:bg-paper-warm transition-colors"
          >
            Staff
          </Link>
          <Link
            href="/admin/nuovo-prodotto"
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-grass hover:bg-grass-deep transition-colors"
          >
            Nuovo Prodotto
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-line p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
            Prodotti
          </span>
          <span className="text-2xl font-extrabold text-ink font-mono">
            {products.length}
          </span>
        </div>
        <div className="bg-white border border-line p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
            Giacenza
          </span>
          <span className="text-2xl font-extrabold text-ink font-mono">
            {totalStock}
          </span>
        </div>
        <div className="bg-white border border-line p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
            Ordini
          </span>
          <span className="text-2xl font-extrabold text-ink font-mono">
            {totalOrders}
          </span>
        </div>
        <div className="bg-white border border-line p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
            Esauriti
          </span>
          <span
            className={`text-2xl font-extrabold font-mono ${
              outOfStockCount > 0 ? "text-soil-deep" : "text-grass-deep"
            }`}
          >
            {outOfStockCount}
          </span>
        </div>
      </div>

      {/* Elenco Prodotti */}
      {products.length === 0 ? (
        <div className="bg-white border border-dashed border-line p-12 text-center space-y-3">
          <p className="text-sm text-ink-soft">Nessun prodotto a catalogo.</p>
          <Link
            href="/admin/nuovo-prodotto"
            className="inline-block text-xs font-bold uppercase tracking-wider text-grass-deep hover:underline"
          >
            Aggiungi prodotto
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-line divide-y divide-line">
          {products.map((product) => {
            const stock = product.variants.reduce((s, v) => s + v.stock, 0);
            const firstPriceCents = product.variants[0]?.priceCents;

            return (
              <Link
                key={product.id}
                href={`/admin/prodotti/${product.id}`}
                className="flex items-center justify-between p-4 hover:bg-paper-warm transition-colors gap-4 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-paper-warm border border-line relative flex-shrink-0 overflow-hidden">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-ink-soft uppercase font-mono">
                        No foto
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-bold text-ink truncate group-hover:text-grass-deep transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {product.brand} / {product.category} / {product.variants.length} taglie
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 space-y-0.5">
                  <p className="text-sm font-bold font-mono text-ink">
                    {firstPriceCents !== undefined
                      ? `€ ${(firstPriceCents / 100).toFixed(2)}`
                      : "—"}
                  </p>
                  <p
                    className={`text-xs font-mono font-semibold ${
                      stock === 0 ? "text-soil-deep" : "text-grass-deep"
                    }`}
                  >
                    {stock === 0 ? "Esaurito" : `${stock} pz`}
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