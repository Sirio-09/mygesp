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
    <div className="min-h-screen bg-[#FBFBF9] py-8 text-ink">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header & ToolBar */}
        <header className="bg-white border border-line p-5 sm:p-6 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-grass"></span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-grass-deep font-bold">
                Area Tecnica
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Pannello di Controllo
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/ordini"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-white hover:bg-paper-warm rounded-lg transition-all shadow-2xs"
            >
              <span>📦</span>
              <span>Ordini</span>
            </Link>
            <Link
              href="/admin/utenti"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-white hover:bg-paper-warm rounded-lg transition-all shadow-2xs"
            >
              <span>👥</span>
              <span>Staff</span>
            </Link>
            <Link
              href="/admin/nuovo-prodotto"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-grass hover:bg-grass-deep rounded-lg transition-all shadow-2xs"
            >
              <span>+</span>
              <span>Nuovo Prodotto</span>
            </Link>
            <div className="pl-1 border-l border-line ml-1">
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* KPI Dashboard */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-line p-4 sm:p-5 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-soft block">
              Prodotti Totali
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-ink font-mono">
                {products.length}
              </span>
              <span className="text-xs text-ink-soft font-medium">Articoli</span>
            </div>
          </div>

          <div className="bg-white border border-line p-4 sm:p-5 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-soft block">
              Pezzi in Stock
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-ink font-mono">
                {totalStock}
              </span>
              <span className="text-xs text-ink-soft font-medium">Giacenza</span>
            </div>
          </div>

          <div className="bg-white border border-line p-4 sm:p-5 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-soft block">
              Ordini Ricevuti
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-ink font-mono">
                {totalOrders}
              </span>
              <span className="text-xs text-ink-soft font-medium">Totali</span>
            </div>
          </div>

          <div className="bg-white border border-line p-4 sm:p-5 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-soft block">
              Esauriti
            </span>
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl sm:text-3xl font-black font-mono ${outOfStockCount > 0 ? "text-soil-deep" : "text-grass-deep"}`}>
                {outOfStockCount}
              </span>
              <span className="text-xs text-ink-soft font-medium">Da Rifornire</span>
            </div>
          </div>
        </section>

        {/* Catalogo Prodotti Table/List */}
        <section className="bg-white border border-line rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-[#FAF9F6]">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-ink">Catalogo Prodotti</h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Seleziona un articolo per modificarne varianti, prezzi e giacenze
              </p>
            </div>
            <span className="bg-white border border-line px-3 py-1 rounded-full text-xs font-mono font-bold text-ink">
              {products.length} articoli
            </span>
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-sm text-ink-soft">Nessun prodotto presente a catalogo.</p>
              <Link
                href="/admin/nuovo-prodotto"
                className="inline-block text-xs font-bold uppercase tracking-wider text-grass-deep hover:underline"
              >
                Aggiungi il primo prodotto →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {products.map((product) => {
                const stock = product.variants.reduce((s, v) => s + v.stock, 0);
                const firstPriceCents = product.variants[0]?.priceCents;

                return (
                  <Link
                    key={product.id}
                    href={`/admin/prodotti/${product.id}`}
                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-paper-warm/80 transition-all gap-4 group"
                  >
                    {/* Immagine e Info Principali */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-paper-warm border border-line relative rounded-lg flex-shrink-0 overflow-hidden shadow-2xs">
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

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-ink truncate group-hover:text-grass-deep transition-colors">
                            {product.name}
                          </p>
                          {product.featured && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-ink-soft">
                          <span className="font-semibold text-ink/80">{product.brand}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px]">{product.category}</span>
                          <span>•</span>
                          <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-[10px] text-gray-700">
                            {product.variants.length} tagli{product.variants.length === 1 ? "a" : "e"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Prezzo e Giacenza */}
                    <div className="text-right flex-shrink-0 space-y-1">
                      <p className="text-sm sm:text-base font-bold font-mono text-ink">
                        {firstPriceCents !== undefined
                          ? `€ ${(firstPriceCents / 100).toFixed(2)}`
                          : "—"}
                      </p>
                      <div>
                        {stock === 0 ? (
                          <span className="inline-block bg-red-50 text-soil-deep border border-red-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                            Esaurito
                          </span>
                        ) : (
                          <span className="inline-block bg-emerald-50 text-grass-deep border border-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                            {stock} pz
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}