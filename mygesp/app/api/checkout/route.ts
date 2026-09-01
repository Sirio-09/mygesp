import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
  try {
    const { items, cap, email, name, address, city } = await req.json();
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

    const subtotalCents = items.reduce(
      (acc: number, item: { variantId: string; quantity: number }) => {
        const variant = variants.find((v) => v.id === item.variantId);
        if (!variant) return acc;
        return acc + getEffectivePriceCents(variant) * item.quantity;
      },
      0
    );

    let shippingCostCents = 0;

    if (subtotalCents < 9900) {
      const cleanCap = cap ? String(cap).trim() : "";
      const prefix2 = cleanCap.substring(0, 2);

      const isSicilyOrSardinia = [
        "90", "91", "92", "93", "94", "95", "96", "97", "98",
        "07", "08", "09"
      ].includes(prefix2);

      const isVeniceLagoon = cleanCap.startsWith("301");
      const isSpecialZone = isSicilyOrSardinia || isVeniceLagoon;

      shippingCostCents = isSpecialZone ? 990 : 690;
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";
    const isCustomer = session?.user && (session.user as { role?: string }).role === "customer";

    const checkoutSession = await stripe.checkout.sessions.create({
      // 🇮🇹 FORZA LA LINGUA ITALIANA SU STRIPE CHECKOUT:
      locale: "it",

      // Pre-compila l'email del cliente
      customer_email: email && email.trim().length > 0 ? email.trim() : undefined,

      // Crea automaticamente una ricevuta/fattura in PDF su Stripe
      invoice_creation: {
        enabled: true,
      },

      // Permette all'utente di inserire Codice Fiscale / Partita IVA
      tax_id_collection: {
        enabled: true,
      },

      line_items: items.map((item: { variantId: string; quantity: number }) => {
        const variant = variants.find((v) => v.id === item.variantId)!;
        const unitAmount = getEffectivePriceCents(variant);

        return {
          price_data: {
            currency: "eur",
            product_data: { name: `${variant.product.name} - ${variant.size}` },
            unit_amount: unitAmount,
          },
          quantity: item.quantity,
        };
      }),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: shippingCostCents,
              currency: "eur",
            },
            display_name:
              shippingCostCents === 0
                ? "Spedizione Gratuita"
                : shippingCostCents === 990
                ? "Spedizione Isole e Zone Disagiate"
                : "Spedizione Standard Italia",
          },
        },
      ],
      mode: "payment",
      success_url: `${origin}/ordine/successo?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrello`,
      metadata: {
        customerId: isCustomer ? (session!.user as { id: string }).id : "",
        shippingName: name || "",
        shippingAddress: address || "",
        shippingCity: city || "",
        shippingCap: cap || "",
        items: JSON.stringify(
          items.map((item: { variantId: string; quantity: number }) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          }))
        ),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("Errore Stripe Checkout:", err);
    return NextResponse.json({ error: err.message || "Errore del server" }, { status: 500 });
  }
}