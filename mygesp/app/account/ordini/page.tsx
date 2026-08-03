import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function OrdiniPage() {
  const session = await auth();
  console.log("Session user:", session?.user);

  if (!session || (session.user as { role?: string })?.role !== "customer") {
    redirect("/account/login");
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.user?.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-[800px] mx-auto px-8 py-12">
      <h1 className="font-display text-3xl uppercase text-loden-deep tracking-wide mb-8">
        I tuoi ordini
      </h1>
      {orders.length === 0 ? (
        <p className="text-slate">Non hai ancora effettuato ordini.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-canvas-deep p-4">
              <div className="flex justify-between text-sm text-mud mb-2">
                <span>{order.createdAt.toLocaleDateString("it-IT")}</span>
                <span className="uppercase font-mono">{order.status}</span>
              </div>
              <div className="font-mono text-rust-deep">
                €{(order.totalCents / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}