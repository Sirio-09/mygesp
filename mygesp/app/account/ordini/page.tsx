// OrdiniPage.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function OrdiniPage() {
  const session = await auth();

  if (!session || (session.user as { role?: string })?.role !== "customer") {
    redirect("/account/login");
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.user?.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
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
        <div className="space-y-6">
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
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="text-2xl font-light tracking-tight text-ink mb-6">
                €{(order.totalCents / 100).toFixed(2)}
              </div>

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
        </div>
      )}
    </main>
  );
}