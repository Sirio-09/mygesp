import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminSection from "@/components/admin/ui/AdminSection";
import { ArrowRight, Package, Plus } from "@/components/admin/ui/icons";
import { formatEuro } from "@/lib/site";

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

  const kpis = [
    {
      label: "Prodotti a catalogo",
      value: products.length,
      hint: "schede pubblicate",
      tone: "text-ink",
    },
    {
      label: "Giacenza totale",
      value: totalStock,
      hint: "pezzi disponibili",
      tone: "text-ink",
    },
    {
      label: "Ordini ricevuti",
      value: totalOrders,
      hint: "tutti gli stati",
      tone: "text-ink",
    },
    {
      label: "Esauriti",
      value: outOfStockCount,
      hint: outOfStockCount > 0 ? "da riassortire" : "tutto disponibile",
      tone: outOfStockCount > 0 ? "text-soil-deep" : "text-grass-deep",
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Area tecnica"
        title="Pannello di controllo"
        description="Catalogo, giacenze e ordini in un'unica vista. Da qui si entra in ogni sezione riservata."
        actions={
          <>
            <AdminButton href="/admin/ordini" variant="secondary">
              Ordini
            </AdminButton>
            <AdminButton href="/admin/nuovo-prodotto">
              Nuovo prodotto
              <Plus className="h-3.5 w-3.5" />
            </AdminButton>
          </>
        }
      />

      <Reveal
        variant="fade"
        className="mt-10 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4"
      >
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-paper p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase leading-4 tracking-[0.18em] text-ink-soft">
              {kpi.label}
            </p>
            <p
              className={`mt-6 text-3xl font-light tabular-nums tracking-tight sm:text-4xl ${kpi.tone}`}
            >
              {kpi.value}
            </p>
            <p className="mt-2 text-[10px] font-light uppercase tracking-[0.14em] text-ink-soft">
              {kpi.hint}
            </p>
          </div>
        ))}
      </Reveal>

      <AdminSection
        className="mt-10"
        label="Catalogo recente"
        description={products.length === 1 ? "1 prodotto" : `${products.length} prodotti`}
        flush
        actions={
          <AdminButton href="/admin/nuovo-prodotto" variant="ghost">
            Aggiungi
            <Plus className="h-3 w-3" />
          </AdminButton>
        }
      >
        {products.length === 0 ? (
          <div className="p-5 sm:p-6">
            <AdminEmptyState
              icon={<Package className="h-5 w-5" />}
              title="Nessun prodotto a catalogo"
              description="Inserisci il primo articolo per iniziare a vendere: immagini, specifiche, taglie e giacenze."
              action={
                <AdminButton href="/admin/nuovo-prodotto" arrow>
                  Crea il primo prodotto
                </AdminButton>
              }
            />
          </div>
        ) : (
          <Reveal as="ul" variant="fade" className="divide-y divide-line/60">
            {products.map((product) => {
              const stock = product.variants.reduce((s, v) => s + v.stock, 0);
              const firstPriceCents = product.variants[0]?.priceCents;
              const cover = product.images[0];

              return (
                <li key={product.id}>
                  <Link
                    href={`/admin/prodotti/${product.id}`}
                    className="group flex items-center gap-4 px-5 py-5 transition-colors duration-300 ease-out-expo hover:bg-paper-warm/40 sm:gap-6 sm:px-6"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-line bg-paper-warm/40">
                      {cover ? (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-[0.14em] text-ink-soft">
                          No img
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-light text-ink transition-colors duration-300 group-hover:text-grass-deep">
                        {product.name}
                      </p>
                      <p className="mt-1 truncate text-xs font-light text-ink-soft">
                        {product.brand} &mdash; {product.category} &middot;{" "}
                        {product.variants.length} taglie
                      </p>

                      <div className="mt-2 flex items-center gap-3 sm:hidden">
                        <span className="font-mono text-xs tabular-nums text-ink">
                          {firstPriceCents !== undefined
                            ? formatEuro(firstPriceCents)
                            : "—"}
                        </span>
                        <AdminBadge tone={stock === 0 ? "neutral" : "grass"}>
                          {stock === 0 ? "Esaurito" : `${stock} pz`}
                        </AdminBadge>
                      </div>
                    </div>

                    <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
                      <p className="text-sm font-light tabular-nums text-ink">
                        {firstPriceCents !== undefined
                          ? formatEuro(firstPriceCents)
                          : "—"}
                      </p>
                      <AdminBadge tone={stock === 0 ? "neutral" : "grass"}>
                        {stock === 0 ? "Esaurito" : `${stock} pz`}
                      </AdminBadge>
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-line transition-all duration-300 ease-out-expo group-hover:translate-x-1 group-hover:text-ink" />

                  </Link>
                </li>
              );
            })}
          </Reveal>
        )}
      </AdminSection>
    </>
  );
}

