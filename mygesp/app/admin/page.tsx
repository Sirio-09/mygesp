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
    <main className="max-w-[600px] mx-auto px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-grass-deep block mb-1">
            Area Tecnica
          </span>
          <h1 className="text-3xl font-extrabold text-ink">
            Catalogo Prodotti
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/utenti"
              className="text-xs font-semibold text-ink-soft hover:text-grass-deep underline transition-colors"
            >
              Staff
            </Link>
            <LogoutButton />
          </div>
          <Link
            href="/admin/nuovo-prodotto"
            className="bg-grass hover:bg-grass-deep text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 transition-colors"
          >
            + Nuovo Prodotto
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-paper-warm border border-dashed border-line p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
            Prodotti a catalogo
          </span>
          <span className="text-xl font-bold font-mono text-soil-deep">
            {products.length}
          </span>
        </div>
        <div className="bg-paper-warm border border-dashed border-line p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
            Pezzi in magazzino
          </span>
          <span className="text-xl font-bold font-mono text-soil-deep">
            {totalStock}
          </span>
        </div>
      </div>

      {/* Elenco Prodotti */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-ink uppercase tracking-wider">
          Elenco Prodotti
        </h2>

        {products.length === 0 ? (
          <div className="border border-dashed border-line p-10 text-center space-y-2">
            <p className="text-xs text-ink-soft">Nessun prodotto ancora a catalogo.</p>
            <Link
              href="/admin/nuovo-prodotto"
              className="inline-block text-xs font-bold uppercase tracking-wider text-grass-deep hover:underline"
            >
              Aggiungi il primo prodotto →
            </Link>
          </div>
        ) : (
          <div className="border-t border-b border-line divide-y divide-line">
            {products.map((product) => {
              const stock = product.variants.reduce((s, v) => s + v.stock, 0);
              const firstPriceCents = product.variants[0]?.priceCents;

              return (
                <Link
                  key={product.id}
                  href={`/admin/prodotti/${product.id}`}
                  className="flex items-center justify-between py-3 px-2 -mx-2 hover:bg-paper-warm transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 bg-line/40 relative flex-shrink-0 overflow-hidden border border-line">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-ink-soft font-mono uppercase">
                          no foto
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-bold text-ink truncate group-hover:text-grass-deep transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {product.brand} · <span className="font-mono">{product.variants.length}</span> taglie
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-0.5 pl-3">
                    <p className="text-sm font-bold font-mono text-soil-deep">
                      {firstPriceCents !== undefined
                        ? `€${(firstPriceCents / 100).toFixed(2)}`
                        : "—"}
                    </p>
                    <p
                      className={`text-xs font-mono ${
                        stock === 0 ? "text-soil-deep font-bold" : "text-ink-soft"
                      }`}
                    >
                      {stock === 0 ? "esaurito" : `${stock} pz`}
                    </p>
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