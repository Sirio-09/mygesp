import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

export const dynamic = "force-dynamic";

const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "canceled",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    (ORDER_STATUSES as readonly string[]).includes(value)
  );
}

/** Stati in cui le giacenze sono già state scaricate (da ripristinare se si annulla). */
const STOCK_DEDUCTED_STATUSES: string[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
];

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Errore recupero ordini:", err);
    return NextResponse.json(
      { error: message || "Errore del server" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const { orderId, status, trackingCode, carrier } = await req.json();

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId mancante" }, { status: 400 });
    }

    if (!isOrderStatus(status)) {
      return NextResponse.json(
        {
          error: `Stato non valido. Valori ammessi: ${ORDER_STATUSES.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { select: { variantId: true, quantity: true } } },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
    }

    const normalizedTracking =
      typeof trackingCode === "string" && trackingCode.trim().length > 0
        ? trackingCode.trim()
        : undefined;

    const normalizedCarrier =
      typeof carrier === "string" && carrier.trim().length > 0
        ? carrier.trim()
        : undefined;

    // Se l'ordine viene annullato dopo che le giacenze erano state scaricate,
    // le rimettiamo a magazzino una sola volta.
    const shouldRestock =
      status === "canceled" &&
      currentOrder.status !== "canceled" &&
      STOCK_DEDUCTED_STATUSES.includes(currentOrder.status);

    // Se un ordine pending viene segnato a mano come pagato/spedito, scarichiamo
    // le giacenze (il webhook non è mai passato in questo caso).
    const shouldDeduct =
      currentOrder.items.length > 0 &&
      STOCK_DEDUCTED_STATUSES.includes(status) &&
      !STOCK_DEDUCTED_STATUSES.includes(currentOrder.status);

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(normalizedTracking !== undefined && {
            trackingCode: normalizedTracking,
          }),
          ...(normalizedCarrier !== undefined && { carrier: normalizedCarrier }),
        },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
            },
          },
        },
      });

      if (shouldRestock) {
        for (const item of currentOrder.items) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      if (shouldDeduct) {
        for (const item of currentOrder.items) {
          await tx.variant.updateMany({
            where: { id: item.variantId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return updated;
    });

    // Email di spedizione: invio non bloccante, non deve far fallire l'aggiornamento.
    if (status === "shipped" && updatedOrder.customerEmail) {
      const itemsHtml = updatedOrder.items
        .map(
          (item) => `
          <li style="margin-bottom: 6px;">
            <strong>${item.variant.product.name}</strong> (Taglia: ${item.variant.size}) - Qta: ${item.quantity}
          </li>
        `
        )
        .join("");

      const trackingHtml = updatedOrder.trackingCode
        ? `
          <div style="background-color: #f9f9f8; border: 1px solid #e5e5e0; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #111; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Dettagli Spedizione</p>
            <p style="margin: 6px 0 0 0; color: #444; font-size: 14px;">Corriere: <strong>${updatedOrder.carrier || "Standard"}</strong></p>
            <p style="margin: 4px 0 0 0; color: #444; font-size: 14px;">Codice Tracking: <strong style="font-family: monospace;">${updatedOrder.trackingCode}</strong></p>
          </div>
        `
        : `
          <p style="color: #666; font-style: italic; font-size: 14px;">
            Il tuo pacco è stato affidato al corriere espresso e ti verrà consegnato nei prossimi giorni lavorativi.
          </p>
        `;

      const result = await sendEmail({
        to: updatedOrder.customerEmail,
        subject: `Ordine #${updatedOrder.id.slice(-8).toUpperCase()} Spedito`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6; border: 1px solid #e5e5e0; padding: 24px; background-color: #ffffff;">
            <h2 style="color: #111; margin-top: 0; font-size: 18px; font-weight: 800; border-bottom: 1px solid #e5e5e0; padding-bottom: 12px; text-transform: uppercase;">Spedizione Confermata</h2>
            <p>Ciao <strong>${updatedOrder.shippingName || "Cliente"}</strong>,</p>
            <p>Il tuo ordine è stato spedito ed è in viaggio verso l'indirizzo indicato.</p>

            ${trackingHtml}

            <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #111; margin-top: 24px;">Riepilogo prodotti</h3>
            <ul style="padding-left: 20px; color: #444; font-size: 14px;">
              ${itemsHtml}
            </ul>

            <hr style="border: none; border-top: 1px solid #e5e5e0; margin: 30px 0;" />
            <p style="font-size: 12px; color: #777; text-align: center; margin-bottom: 0;">
              Grazie per aver acquistato da MyGesp. Per informazioni puoi rispondere a questa email.
            </p>
          </div>
        `,
      });

      if (result.ok) {
        console.log(`Email di spedizione inviata a: ${updatedOrder.customerEmail}`);
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Errore aggiornamento stato ordine:", err);
    return NextResponse.json(
      { error: message || "Errore del server" },
      { status: 500 }
    );
  }
}
