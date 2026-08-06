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
    <main className="max-w-[1000px] mx-auto px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="text-rust text-xs tracking-[0.1em] uppercase mb-1 font-semibold">
            Area tecnica
          </div>
          <h1 className="font-display text-3xl uppercase text-loden-deep tracking-wide">
            Catalogo prodotti
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/admin/utenti" className="text-mud hover:text-rust text-sm">
            Staff
          </Link>
          <LogoutButton />
          <Link
            href="/admin/nuovo-prodotto"
            className="bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide text-sm font-semibold py-3 px-5"
          >
            + Nuovo prodotto
          </Link>
        </div>
      </div>

      {/* riepilogo — cartellini tecnici, coerenti col design system */}
      <div className="flex gap-4 mb-10">
        <div className="bg-white border border-dashed border-mud py-3 px-4">
          <div className="text-[10px] tracking-wide text-slate uppercase mb-1">Prodotti a catalogo</div>
          <div className="font-mono text-xl font-medium text-rust-deep">{products.length}</div>
        </div>
        <div className="bg-white border border-dashed border-mud py-3 px-4">
          <div className="text-[10px] tracking-wide text-slate uppercase mb-1">Pezzi in magazzino</div>
          <div className="font-mono text-xl font-medium text-rust-deep">{totalStock}</div>
        </div>
      </div>

      {/* lista prodotti */}
      {products.length === 0 ? (
        <div className="border border-dashed border-mud py-16 text-center">
          <p className="text-slate mb-4">Nessun prodotto ancora a catalogo.</p>
          <Link href="/admin/nuovo-prodotto" className="text-rust hover:underline text-sm">
            Aggiungi il primo prodotto →
          </Link>
        </div>
      ) : (
        <div className="border-t border-canvas-deep">
          {products.map((product) => {
            const stock = product.variants.reduce((s, v) => s + v.stock, 0);
            return (
              <Link
                key={product.id}
                href={`/admin/prodotti/${product.id}`}
                className="flex items-center gap-4 py-3 border-b border-canvas-deep hover:bg-white transition-colors px-2 -mx-2"
              >
                <div className="w-14 h-14 bg-[#DCD4BF] flex-shrink-0 relative overflow-hidden">
                  {product.images[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-mud">
                      no foto
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-loden-deep truncate">{product.name}</p>
                  <p className="text-xs text-mud">{product.brand} · {product.variants.length} taglie</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-sm text-rust-deep">
                    €{product.variants[0] ? (product.variants[0].priceCents / 100).toFixed(2) : "—"}
                  </p>
                  <p className={`text-xs ${stock === 0 ? "text-rust" : "text-mud"}`}>
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