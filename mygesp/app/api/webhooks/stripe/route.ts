import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getStripeClient,
  getStripeWebhookSecret,
  isStripeConfigured,
} from "@/lib/stripe";
import { sendEmail } from "@/lib/resend";

export const dynamic = "force-dynamic";

type FullOrder = {
  id: string;
  totalCents: number;
  customerEmail: string;
  shippingName: string | null;
  items: {
    variantId: string;
    quantity: number;
    priceCents: number;
    variant: { size: string; product: { name: string } };
  }[];
};

const ORDER_INCLUDE = {
  items: {
    include: {
      variant: {
        include: { product: true },
      },
    },
  },
} as const;

function getEffectivePriceCents(variant: {
  priceCents: number;
  product: { discountPercent: number | null; discountUntil: Date | null };
}): number {
  const { priceCents, product } = variant;

  const isDiscountActive =
    typeof product.discountPercent === "number" &&
    product.discountPercent > 0 &&
    (!product.discountUntil || new Date(product.discountUntil) > new Date());

  if (isDiscountActive) {
    return Math.round(priceCents * ((100 - product.discountPercent!) / 100));
  }

  return priceCents;
}

/**
 * Conferma l'ordine pagato. Idempotente: se l'ordine è già "paid" non fa nulla.
 */
async function confirmPaidOrder(
  session: Stripe.Checkout.Session
): Promise<FullOrder | null> {
  const metadata = session.metadata ?? {};
  const stripeSessionId = session.id;

  let order = metadata.orderId
    ? await prisma.order.findUnique({
        where: { id: metadata.orderId },
        include: ORDER_INCLUDE,
      })
    : null;

  if (!order) {
    order = await prisma.order.findFirst({
      where: { stripeSessionId },
      include: ORDER_INCLUDE,
    });
  }

  if (order?.status === "paid") {
    console.log("Ordine già processato, salto duplicato:", stripeSessionId);
    return null;
  }

  const stripeAddress = session.customer_details?.address;

  const customerEmail =
    session.customer_details?.email ?? session.customer_email ?? order?.customerEmail ?? "";

  const shippingName =
    metadata.shippingName || session.customer_details?.name || null;
  const shippingLine1 = metadata.shippingAddress || stripeAddress?.line1 || null;
  const shippingCity = metadata.shippingCity || stripeAddress?.city || null;
  const shippingZip = metadata.shippingCap || stripeAddress?.postal_code || null;
  const shippingCountry = stripeAddress?.country || "IT";
  // Fallback legacy: nessun ordine pending trovato → creiamo l'ordine ex-novo.
  if (!order) {
    const legacyItems = parseLegacyItems(metadata.items);

    if (legacyItems.length === 0) {
      console.error(
        "Nessun ordine trovato e metadata.items assente: impossibile ricostruire l'ordine per la sessione",
        stripeSessionId
      );
      return null;
    }

    const variants = await prisma.variant.findMany({
      where: { id: { in: legacyItems.map((item) => item.variantId) } },
      include: { product: true },
    });

    order = await prisma.order.create({
      data: {
        customerEmail: customerEmail || "sconosciuto",
        customerId: metadata.customerId || null,
        shippingName,
        shippingLine1,
        shippingCity,
        shippingZip,
        shippingCountry,
        totalCents: session.amount_total ?? 0,
        status: "paid",
        stripeSessionId,
        items: {
          create: legacyItems.map((item) => {
            const variant = variants.find((v) => v.id === item.variantId);
            return {
              variantId: item.variantId,
              quantity: item.quantity,
              priceCents: variant ? getEffectivePriceCents(variant) : 0,
            };
          }),
        },
      },
      include: ORDER_INCLUDE,
    });

    for (const item of order.items) {
      await decrementStock(item.variantId, item.quantity);
    }

    return order;
  }

  const orderId = order.id;

  const confirmed = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: "paid",
        stripeSessionId,
        customerEmail: customerEmail || order.customerEmail,
        shippingName: shippingName ?? order.shippingName,
        shippingLine1: shippingLine1 ?? order.shippingLine1,
        shippingCity: shippingCity ?? order.shippingCity,
        shippingZip: shippingZip ?? order.shippingZip,
        shippingCountry,
        totalCents: session.amount_total ?? order.totalCents,
      },
      include: ORDER_INCLUDE,
    });

    // Scarico giacenze una sola volta, sulla base delle righe d'ordine reali.
    for (const item of updated.items) {
      const result = await tx.variant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });

      if (result.count === 0) {
        console.warn(
          `Giacenza insufficiente per la variante ${item.variantId}: porto lo stock a 0.`
        );
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: 0 },
        });
      }
    }

    return updated;
  });

  return confirmed;
}

async function decrementStock(variantId: string, quantity: number) {
  const result = await prisma.variant.updateMany({
    where: { id: variantId, stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  });

  if (result.count === 0) {
    await prisma.variant.update({ where: { id: variantId }, data: { stock: 0 } });
  }
}

async function sendOrderConfirmation(
  order: FullOrder,
  session: Stripe.Checkout.Session
) {
  const customerEmail = order.customerEmail;

  if (!customerEmail || customerEmail === "sconosciuto") return;

  let invoicePdfUrl: string | null = null;

  const invoiceId =
    typeof session.invoice === "string"
      ? session.invoice
      : session.invoice?.id ?? null;

  if (invoiceId) {
    try {
      const invoice = await getStripeClient().invoices.retrieve(invoiceId);
      invoicePdfUrl = invoice.invoice_pdf || invoice.hosted_invoice_url || null;
    } catch (invoiceErr) {
      console.error("Impossibile recuperare la fattura Stripe:", invoiceErr);
    }
  }

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.variant.product.name}</strong> (Taglia: ${item.variant.size})
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            €${((item.priceCents * item.quantity) / 100).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  const invoiceButtonHtml = invoicePdfUrl
    ? `
      <div style="margin: 30px 0; text-align: center;">
        <a href="${invoicePdfUrl}" target="_blank" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          📄 Scarica Fattura PDF
        </a>
      </div>
    `
    : "";

  const result = await sendEmail({
    to: customerEmail,
    subject: `Conferma Ordine e Fattura #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #eee; padding: 24px; border-radius: 8px;">
        <h2 style="color: #111; text-align: center; margin-top: 0;">Grazie per il tuo ordine!</h2>
        <p>Ciao <strong>${order.shippingName || "Cliente"}</strong>,</p>
        <p>Abbiamo ricevuto il tuo pagamento e il tuo ordine è in fase di preparazione.</p>

        <div style="background-color: #f8f9fa; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #222; font-size: 16px;">Riepilogo Spedizione</h3>
          <p style="margin: 4px 0;"><strong>ID Ordine:</strong> #${order.id}</p>
        </div>

        <h3 style="font-size: 16px; color: #222;">Prodotti Acquistati</h3>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background-color: #f1f1f1;">
              <th style="padding: 10px; border-bottom: 2px solid #ddd;">Prodotto</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">Qtà</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Prezzo</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px;">
          <h3 style="margin: 0;">Totale Pagato: €${(order.totalCents / 100).toFixed(2)}</h3>
        </div>

        ${invoiceButtonHtml}

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #777; text-align: center; margin-bottom: 0;">
          Se hai domande o desideri assistenza, puoi rispondere direttamente a questa email.
        </p>
      </div>
    `,
  });

  if (result.ok) {
    console.log("Email di conferma ordine inviata a:", customerEmail);
  }
}
function parseLegacyItems(
  raw: string | undefined
): { variantId: string; quantity: number }[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (entry): entry is { variantId: string; quantity: number } =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as { variantId?: unknown }).variantId === "string" &&
          Number.isFinite(Number((entry as { quantity?: unknown }).quantity))
      )
      .map((entry) => ({
        variantId: entry.variantId,
        quantity: Math.max(1, Number.parseInt(String(entry.quantity), 10) || 1),
      }));
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Firma stripe-signature mancante" },
      { status: 400 }
    );
  }

  if (!isStripeConfigured()) {
    console.error(
      "Webhook Stripe: STRIPE_SECRET_KEY non configurata, impossibile verificare la firma."
    );
    return NextResponse.json(
      { error: "Stripe non configurato sul server" },
      { status: 503 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripeClient().webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret()
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Webhook signature non valida:", err);
    return NextResponse.json(
      { error: `Signature non valida: ${message}` },
      { status: 400 }
    );
  }

  console.log("Evento Stripe ricevuto:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;

        // Con metodi di pagamento asincroni "completed" può arrivare con
        // payment_status "unpaid": in quel caso aspettiamo async_payment_succeeded.
        if (
          event.type === "checkout.session.completed" &&
          session.payment_status === "unpaid"
        ) {
          console.log(
            "Sessione completata ma non ancora pagata, attendo conferma asincrona:",
            session.id
          );
          break;
        }

        const order = await confirmPaidOrder(session);

        if (order) {
          await sendOrderConfirmation(order, session);
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const metadata = session.metadata ?? {};

        const pendingOrder = metadata.orderId
          ? await prisma.order.findUnique({ where: { id: metadata.orderId } })
          : await prisma.order.findFirst({
              where: { stripeSessionId: session.id },
            });

        if (pendingOrder && pendingOrder.status === "pending") {
          await prisma.order.update({
            where: { id: pendingOrder.id },
            data: { status: "canceled" },
          });
          console.log("Ordine pending annullato (sessione scaduta):", pendingOrder.id);
        }

        break;
      }

      default:
        break;
    }
  } catch (err) {
    // Rispondiamo comunque 200 per evitare retry storm di Stripe su errori
    // applicativi già loggati (es. email non inviata).
    console.error("ERRORE durante la gestione dell'evento Stripe:", err);
  }

  return NextResponse.json({ received: true });
}
