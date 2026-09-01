import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const resend = new Resend(process.env.RESEND_API_KEY);

// Calcola il prezzo scontato effettivo in centesimi per il singolo articolo
function getEffectivePriceCents(variant: {
  priceCents: number;
  product: { discountPercent: number | null; discountUntil: Date | null };
}): number {
  const { priceCents, product } = variant;
  const now = new Date();

  const isDiscountActive =
    product.discountPercent &&
    product.discountPercent > 0 &&
    (!product.discountUntil || new Date(product.discountUntil) > now);

  if (isDiscountActive) {
    const discountMultiplier = (100 - product.discountPercent!) / 100;
    return Math.round(priceCents * discountMultiplier);
  }

  return priceCents;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Firma stripe-signature mancante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature non valida:", err);
    return NextResponse.json({ error: `Signature non valida: ${err.message}` }, { status: 400 });
  }

  console.log("Evento ricevuto:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("Sto per creare l'ordine per la sessione:", session.id);

    try {
      const metadata = session.metadata || {};
      const itemsFromMetadata: { variantId: string; quantity: number }[] = JSON.parse(
        metadata.items ?? "[]"
      );

      const variants = await prisma.variant.findMany({
        where: { id: { in: itemsFromMetadata.map((i) => i.variantId) } },
        include: { product: true },
      });

      const stripeAddress = session.customer_details?.address;

      const shippingName = metadata.shippingName || session.customer_details?.name || null;
      const shippingLine1 = metadata.shippingAddress || stripeAddress?.line1 || null;
      const shippingCity = metadata.shippingCity || stripeAddress?.city || null;
      const shippingZip = metadata.shippingCap || stripeAddress?.postal_code || null;
      const shippingCountry = stripeAddress?.country || "IT";

      const customerEmail =
        session.customer_details?.email ?? session.customer_email ?? null;

      // 1. Recupera la fattura PDF generata automaticamente da Stripe
      let invoicePdfUrl: string | null = null;
      if (session.invoice) {
        try {
          const invoice = await stripe.invoices.retrieve(session.invoice as string);
          invoicePdfUrl = invoice.invoice_pdf || invoice.hosted_invoice_url || null;
        } catch (invoiceErr) {
          console.error("Impossibile recuperare la fattura Stripe:", invoiceErr);
        }
      }

      // 2. Creazione dell'ordine e decremento giacenze a magazzino in transazione
      let createdOrder: any = null;

      await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            customerEmail: customerEmail ?? "sconosciuto",
            customerId: metadata.customerId || null,
            shippingName,
            shippingLine1,
            shippingCity,
            shippingZip,
            shippingCountry,
            totalCents: session.amount_total ?? 0,
            status: "paid",
            items: {
              create: itemsFromMetadata.map((item) => {
                const variant = variants.find((v) => v.id === item.variantId);
                const effectivePrice = variant ? getEffectivePriceCents(variant) : 0;

                return {
                  variantId: item.variantId,
                  quantity: item.quantity,
                  priceCents: effectivePrice,
                };
              }),
            },
          },
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

        // Scarica le giacenze per ciascun articolo acquistato
        for (const item of itemsFromMetadata) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        createdOrder = order;
      });

      console.log("Ordine creato con successo, id:", createdOrder.id);

      // 3. Invio email di conferma ordine + fattura tramite Resend
      if (customerEmail && process.env.RESEND_API_KEY && createdOrder) {
        const itemsHtml = createdOrder.items
          .map(
            (item: any) => `
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

        await resend.emails.send({
          from: "MyGesp <onboarding@resend.dev>", // In produzione usa il tuo dominio verificato es: "info@tuodominio.it"
          to: customerEmail,
          subject: `Conferma Ordine e Fattura #${createdOrder.id.slice(-8).toUpperCase()}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #eee; padding: 24px; border-radius: 8px;">
              <h2 style="color: #111; text-align: center; margin-top: 0;">Grazie per il tuo ordine!</h2>
              <p>Ciao <strong>${shippingName || "Cliente"}</strong>,</p>
              <p>Abbiamo ricevuto il tuo pagamento e il tuo ordine è in fase di preparazione.</p>

              <div style="background-color: #f8f9fa; padding: 16px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #222; font-size: 16px;">Riepilogo Spedizione</h3>
                <p style="margin: 4px 0;"><strong>ID Ordine:</strong> #${createdOrder.id}</p>
                <p style="margin: 4px 0;"><strong>Indirizzo:</strong> ${shippingLine1 || ""}, ${shippingCity || ""} ${shippingZip || ""}</p>
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
                <h3 style="margin: 0;">Totale Pagato: €${(createdOrder.totalCents / 100).toFixed(2)}</h3>
              </div>

              ${invoiceButtonHtml}

              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 12px; color: #777; text-align: center; margin-bottom: 0;">
                Se hai domande o desideri assistenza, puoi rispondere direttamente a questa email.
              </p>
            </div>
          `,
        });

        console.log("Email di conferma d'ordine e fattura inviata a:", customerEmail);
      }
    } catch (err) {
      console.error("ERRORE durante la gestione dell'ordine/email:", err);
      return NextResponse.json({ error: "Errore durante l'elaborazione" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}