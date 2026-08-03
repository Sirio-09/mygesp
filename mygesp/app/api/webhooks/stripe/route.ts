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
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      const order = await prisma.order.create({
        data: {
          customerEmail: session.customer_details?.email ?? "sconosciuto",
          customerId: session.metadata?.customerId || null,
          totalCents: session.amount_total ?? 0,
          status: "paid",
          items: {
            create: lineItems.data.map((li) => ({
              variantId: "N/A",
              quantity: li.quantity ?? 1,
              priceCents: li.amount_total ?? 0,
            })),
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