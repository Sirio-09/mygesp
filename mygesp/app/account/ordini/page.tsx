// OrdiniPage.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Reveal from "@/components/motion/Reveal";
import { formatEuro } from "@/lib/site";
import { privatePageMetadata } from "@/lib/metadata";
import {
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_TONES,
  orderStatusLabel,
} from "@/lib/order-status";

export const metadata: Metadata = privatePageMetadata("I miei ordini");

export default async function OrdiniPage() {
  const session = await auth();

  if (!session || (session.user as { role?: string })?.role !== "customer") {
    redirect("/account/login");
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.user?.id },
    include: {
      items: {
        include: {
          variant: {
            select: {
              size: true,
              product: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="max-w-[880px] mx-auto px-6 py-16 lg:py-24">
      <div className="mb-12">
        <p className="text-ink-soft text-[10px] font-semibold uppercase tracking-[0.2em] mb-4">
          Il tuo account
        </p>
        <h1 className="text-ink font-light text-3xl sm:text-4xl tracking-tight">
          I tuoi ordini
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="border border-line/40 p-12 text-center bg-paper">
          <p className="text-sm font-light text-ink-soft">Non hai ancora effettuato ordini.</p>
        </div>
      ) : (
        <Reveal variant="fade" className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-line/40 p-6 sm:p-8 bg-paper transition-colors hover:border-line/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    Data Ordine
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {order.createdAt.toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex flex-col sm:items-end gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    Stato
                  </span>
                  <span
                    className={`inline-block border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                      ORDER_STATUS_BADGE_CLASSES[
                        ORDER_STATUS_TONES[order.status] ?? "neutral"
                      ]
                    }`}
                  >
                    {orderStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              <div className="mb-6 border-t border-line/50 pt-6 text-2xl font-light tabular-nums tracking-tight text-ink">
                {formatEuro(order.totalCents)}
              </div>

              {order.items.length > 0 && (
                <div className="border-t border-line/40 pt-6">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft mb-3">
                    Articoli
                  </h4>
                  <ul className="divide-y divide-line/40">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-baseline justify-between gap-4 py-2 text-sm font-light text-ink"
                      >
                        <span className="min-w-0">
                          <Link
                            href={`/prodotto/${item.variant.product.slug}`}
                            className="underline decoration-line/70 underline-offset-4 transition-colors hover:text-grass-deep"
                          >
                            {item.variant.product.name}
                          </Link>
                          <span className="text-ink-soft">
                            {" "}
                            · Taglia {item.variant.size} · Qtà {item.quantity}
                          </span>
                        </span>
                        <span className="shrink-0 tabular-nums text-ink-soft">
                          {formatEuro(item.priceCents * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(order.trackingCode || order.carrier) && (
                <div className="mt-6 border-t border-line/40 pt-6">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft mb-3">
                    Spedizione
                  </h4>
                  <p className="text-sm font-light text-ink">
                    {order.carrier ? `${order.carrier} · ` : ""}
                    {order.trackingCode ? (
                      <span className="font-mono text-xs tracking-[0.05em]">
                        {order.trackingCode}
                      </span>
                    ) : (
                      "In preparazione"
                    )}
                  </p>
                </div>
              )}

              {order.shippingLine1 && (
                <div className="border-t border-line/40 pt-6">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft mb-3">
                    Indirizzo di spedizione
                  </h4>
                  <div className="text-sm font-light text-ink leading-relaxed">
                    <p className="font-medium">{order.shippingName}</p>
                    <p>{order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ""}</p>
                    <p>{order.shippingZip} {order.shippingCity} ({order.shippingState})</p>
                    <p className="text-ink-soft">{order.shippingCountry}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </Reveal>
      )}
    </main>
  );
}