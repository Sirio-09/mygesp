import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { items } = await req.json();
  const session = await auth();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
  }

  const variantIds = items.map((i: { variantId: string }) => i.variantId);
  const variants = await prisma.variant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant || variant.stock < item.quantity) {
      return NextResponse.json(
        { error: `Quantità non disponibile per ${variant?.product.name ?? "un articolo"}` },
        { status: 400 }
      );
    }
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const isCustomer = session?.user && (session.user as { role?: string }).role === "customer";

  const checkoutSession = await stripe.checkout.sessions.create({
    line_items: items.map((item: { variantId: string; quantity: number }) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return {
        price_data: {
          currency: "eur",
          product_data: { name: `${variant.product.name} - ${variant.size}` },
          unit_amount: variant.priceCents,
        },
        quantity: item.quantity,
      };
    }),
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["IT", "FR", "DE", "AT", "CH", "ES", "PT", "BE", "NL", "LU"],
    },
    success_url: `${origin}/ordine/successo?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/carrello`,
    metadata: {
      customerId: isCustomer ? (session!.user as { id: string }).id : "",
      items: JSON.stringify(
        items.map((item: { variantId: string; quantity: number }) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        }))
      ),
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}