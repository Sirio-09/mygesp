import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature non valida:", err);
    return NextResponse.json({ error: "Signature non valida" }, { status: 400 });
  }

  console.log("Evento ricevuto:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("Sto per creare l'ordine per la sessione:", session.id);

    try {
      const itemsFromMetadata: { variantId: string; quantity: number }[] = JSON.parse(
        session.metadata?.items ?? "[]"
      );

      const variants = await prisma.variant.findMany({
        where: { id: { in: itemsFromMetadata.map((i) => i.variantId) } },
      });

      const shipping = session.customer_details?.address;

      const order = await prisma.order.create({
        data: {
          customerEmail: session.customer_details?.email ?? "sconosciuto",
          customerId: session.metadata?.customerId || null,
          shippingName: session.customer_details?.name || null,
          shippingLine1: shipping?.line1 || null,
          shippingLine2: shipping?.line2 || null,
          shippingCity: shipping?.city || null,
          shippingZip: shipping?.postal_code || null,
          shippingState: shipping?.state || null,
          shippingCountry: shipping?.country || null,
          totalCents: session.amount_total ?? 0,
          status: "paid",
          items: {
            create: itemsFromMetadata.map((item) => {
              const variant = variants.find((v) => v.id === item.variantId);
              return {
                variantId: item.variantId,
                quantity: item.quantity,
                priceCents: variant?.priceCents ?? 0,
              };
            }),
          },
        },
      });

      console.log("Ordine creato con successo, id:", order.id);
    } catch (err) {
      console.error("ERRORE durante la creazione dell'ordine:", err);
    }
  }

  return NextResponse.json({ received: true });
}