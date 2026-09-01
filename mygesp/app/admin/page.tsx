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
    <main className="min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8 selection:bg-grass selection:text-white">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-line/40 pb-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-grass mb-2 block">
              Area Tecnica
            </span>
            <h1 className="text-3xl font-light text-ink tracking-tight">
              Pannello Admin
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/admin/ordini"
              className="text-[10px] font-semibold text-ink-soft hover:text-ink uppercase tracking-widest transition-colors"
            >
              Ordini
            </Link>
            <span className="text-line/40">|</span>
            <Link
              href="/admin/utenti"
              className="text-[10px] font-semibold text-ink-soft hover:text-ink uppercase tracking-widest transition-colors"
            >
              Staff
            </Link>
            <span className="text-line/40">|</span>
            <div className="flex items-center gap-4 pl-2">
              <Link
                href="/admin/nuovo-prodotto"
                className="bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-3 px-6 transition-colors"
              >
                Nuovo Prodotto
              </Link>
              {/* Assicurati che LogoutButton supporti il passaggio di stili minimal o lo erediti naturalmente */}
              <LogoutButton /> 
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="bg-transparent border border-line/40 p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
              Prodotti Attivi
            </span>
            <span className="text-4xl font-light text-ink tracking-tight">
              {products.length}
            </span>
          </div>
          <div className="bg-transparent border border-line/40 p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
              Giacenza Totale
            </span>
            <span className="text-4xl font-light text-ink tracking-tight">
              {totalStock}
            </span>
          </div>
          <div className="bg-transparent border border-line/40 p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
              Ordini Ricevuti
            </span>
            <span className="text-4xl font-light text-ink tracking-tight">
              {totalOrders}
            </span>
          </div>
          <div className="bg-transparent border border-line/40 p-6 flex flex-col justify-between h-32">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
              Esauriti
            </span>
            <span className={`text-4xl font-light tracking-tight ${outOfStockCount > 0 ? "text-ink" : "text-grass"}`}>
              {outOfStockCount}
            </span>
          </div>
        </div>

        {/* Elenco Prodotti */}
        <div>
          <div className="mb-4">
             <span className="text-[10px] font-semibold text-ink uppercase tracking-widest block">
               Catalogo Recente
             </span>
          </div>
          
          {products.length === 0 ? (
            <div className="bg-transparent border border-line/40 p-16 text-center space-y-4">
              <p className="text-sm font-light text-ink-soft">Nessun prodotto a catalogo.</p>
              <Link
                href="/admin/nuovo-prodotto"
                className="inline-block text-[10px] font-semibold uppercase tracking-widest text-ink hover:text-grass transition-colors"
              >
                Aggiungi il tuo primo prodotto &rarr;
              </Link>
            </div>
          ) : (
            <div className="bg-transparent border border-line/40 divide-y divide-line/40">
              {products.map((product) => {
                const stock = product.variants.reduce((s, v) => s + v.stock, 0);
                const firstPriceCents = product.variants[0]?.priceCents;

                return (
                  <Link
                    key={product.id}
                    href={`/admin/prodotti/${product.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-line/5 transition-colors gap-6 group"
                  >
                    <div className="flex items-center gap-6 min-w-0">
                      <div className="w-16 h-16 border border-line/40 relative flex-shrink-0 bg-transparent overflow-hidden">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-ink-soft uppercase tracking-widest text-center px-1">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="text-base font-light text-ink truncate group-hover:text-grass transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs font-light text-ink-soft">
                          {product.brand} &mdash; {product.category} ({product.variants.length} Taglie)
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center flex-shrink-0 gap-2 sm:gap-1 pl-22 sm:pl-0 border-t border-line/40 sm:border-0 pt-4 sm:pt-0">
                      <p className="text-sm font-light text-ink">
                        {firstPriceCents !== undefined
                          ? `€ ${(firstPriceCents / 100).toFixed(2)}`
                          : "—"}
                      </p>
                      <p
                        className={`text-[10px] uppercase tracking-widest font-semibold ${
                          stock === 0 ? "text-ink-soft" : "text-grass"
                        }`}
                      >
                        {stock === 0 ? "Esaurito" : `${stock} pz disponibili`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}