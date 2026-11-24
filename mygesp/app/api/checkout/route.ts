import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import {
  getSiteUrl,
  getStripeClient,
  isStripeConfigured,
} from "@/lib/stripe";

export const dynamic = "force-dynamic";

type IncomingItem = { variantId: string; quantity: number };

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

function normalizeItems(rawItems: unknown): IncomingItem[] | null {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return null;
  if (rawItems.length > 50) return null;

  const merged = new Map<string, number>();

  for (const entry of rawItems) {
    if (typeof entry !== "object" || entry === null) return null;

    const { variantId, quantity } = entry as {
      variantId?: unknown;
      quantity?: unknown;
    };

    if (typeof variantId !== "string" || variantId.trim().length === 0) {
      return null;
    }

    const parsedQuantity = Number.parseInt(String(quantity), 10);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) return null;

    const cappedQuantity = Math.min(parsedQuantity, 99);
    const key = variantId.trim();

    merged.set(key, Math.min((merged.get(key) ?? 0) + cappedQuantity, 99));
  }

  const items = Array.from(merged.entries()).map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));

  return items.length > 0 ? items : null;
}

function calculateShippingCents(subtotalCents: number, cap: string): number {
  if (subtotalCents >= 9900) return 0;

  const prefix2 = cap.substring(0, 2);

  const isSicilyOrSardinia = [
    "90", "91", "92", "93", "94", "95", "96", "97", "98",
    "07", "08", "09",
  ].includes(prefix2);

  const isVeniceLagoon = cap.startsWith("301");

  return isSicilyOrSardinia || isVeniceLagoon ? 990 : 690;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
    }

    const { items, cap, email, name, address, city } = body as Record<
      string,
      unknown
    >;

    const normalizedItems = normalizeItems(items);

    if (!normalizedItems) {
      return NextResponse.json(
        { error: "Carrello vuoto o dati degli articoli non validi." },
        { status: 400 }
      );
    }

    const cleanCap = typeof cap === "string" ? cap.trim() : "";

    if (cleanCap && !/^\d{5}$/.test(cleanCap)) {
      return NextResponse.json({ error: "CAP non valido." }, { status: 400 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Pagamenti non configurati: manca STRIPE_SECRET_KEY nel file .env.local.",
        },
        { status: 503 }
      );
    }

    const session = await auth();
    const customerId =
      session?.user && (session.user as { role?: string }).role === "customer"
        ? (session.user as { id: string }).id
        : null;

    const variantIds = normalizedItems.map((item) => item.variantId);
    const variants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length !== variantIds.length) {
      return NextResponse.json(
        {
          error:
            "Alcuni articoli nel carrello non sono più disponibili. Aggiorna il carrello e riprova.",
        },
        { status: 400 }
      );
    }

    for (const item of normalizedItems) {
      const variant = variants.find((v) => v.id === item.variantId);

      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Quantità non disponibile per ${variant?.product.name ?? "un articolo"}.`,
          },
          { status: 400 }
        );
      }
    }

    const subtotalCents = normalizedItems.reduce((acc, item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return acc + getEffectivePriceCents(variant) * item.quantity;
    }, 0);

    const shippingCostCents = calculateShippingCents(subtotalCents, cleanCap);
    const totalCents = subtotalCents + shippingCostCents;

    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanAddress = typeof address === "string" ? address.trim() : "";
    const cleanCity = typeof city === "string" ? city.trim() : "";

    // 1. Creiamo subito l'ordine in stato "pending": è la fonte di verità che il
    // webhook confermerà. In questo modo il metadata Stripe resta piccolo
    // (limite 500 caratteri per valore) e non dipendiamo dal carrello client.
    const order = await prisma.order.create({
      data: {
        customerEmail: cleanEmail,
        customerId,
        shippingName: cleanName || null,
        shippingLine1: cleanAddress || null,
        shippingCity: cleanCity || null,
        shippingZip: cleanCap || null,
        shippingCountry: "IT",
        totalCents,
        status: "pending",
        items: {
          create: normalizedItems.map((item) => {
            const variant = variants.find((v) => v.id === item.variantId)!;
            return {
              variantId: item.variantId,
              quantity: item.quantity,
              priceCents: getEffectivePriceCents(variant),
            };
          }),
        },
      },
    });

    const origin = getSiteUrl();

    let checkoutSession;
    try {
      checkoutSession = await getStripeClient().checkout.sessions.create({
        locale: "it",
        customer_email: cleanEmail.length > 0 ? cleanEmail : undefined,
        client_reference_id: order.id,
        invoice_creation: { enabled: true },
        tax_id_collection: { enabled: true },
        line_items: normalizedItems.map((item) => {
          const variant = variants.find((v) => v.id === item.variantId)!;
          return {
            price_data: {
              currency: "eur",
              product_data: {
                name: `${variant.product.name} - ${variant.size}`,
              },
              unit_amount: getEffectivePriceCents(variant),
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
          orderId: order.id,
          customerId: customerId ?? "",
          shippingName: cleanName.slice(0, 300),
          shippingAddress: cleanAddress.slice(0, 300),
          shippingCity: cleanCity.slice(0, 200),
          shippingCap: cleanCap.slice(0, 10),
        },
      });
    } catch (stripeErr) {
      // Rollback dell'ordine pending: non deve restare appeso se Stripe fallisce.
      try {
        await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
        await prisma.order.delete({ where: { id: order.id } });
      } catch (rollbackErr) {
        console.error("Rollback ordine pending fallito:", rollbackErr);
      }
      throw stripeErr;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url, orderId: order.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Errore Stripe Checkout:", err);

    // Stripe risponde "Not a valid URL" quando success_url/cancel_url non sono
    // URL assoluti validi: quasi sempre è un problema di NEXT_PUBLIC_SITE_URL.
    // Al cliente non serve l'errore tecnico in inglese.
    const isUrlConfigError = /valid URL|invalid URL/i.test(message);

    return NextResponse.json(
      {
        error: isUrlConfigError
          ? "Configurazione pagamenti non valida: l'URL del sito non è corretto. Riprova più tardi o contatta l'assistenza."
          : message || "Errore del server",
      },
      { status: 500 }
    );
  }
}
