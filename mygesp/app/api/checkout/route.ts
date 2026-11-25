import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import {
  getSiteUrl,
  getStripeClient,
  isStripeConfigured,
} from "@/lib/stripe";
import { calculateShippingCents, getShippingLabel } from "@/lib/site";
import { rateLimitResponse } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

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

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limited = await rateLimitResponse(
      `checkout:ip:${ip}`,
      10,
      10 * 60 * 1000
    );
    if (limited) return limited;

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
    }

    const { items, cap, email, name, address, city, expectedSubtotalCents } =
      body as Record<string, unknown>;

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

    // Coerenza prezzi: il client mostra il riepilogo con i prezzi salvati nel
    // carrello (localStorage). Se nel frattempo un prezzo o uno sconto è
    // cambiato, l'utente pagherebbe un importo diverso da quello che ha letto:
    // blocchiamo il checkout chiedendogli di ricontrollare il carrello.
    if (
      typeof expectedSubtotalCents === "number" &&
      Number.isFinite(expectedSubtotalCents) &&
      expectedSubtotalCents !== subtotalCents
    ) {
      return NextResponse.json(
        {
          error:
            "I prezzi di alcuni articoli sono cambiati. Abbiamo aggiornato il riepilogo: controllalo e riprova.",
          code: "price-changed",
          subtotalCents,
          // Prezzi autorevoli per permettere al client di riallineare il
          // carrello locale (localStorage) invece di restare bloccato.
          prices: normalizedItems.map((item) => ({
            variantId: item.variantId,
            priceCents: getEffectivePriceCents(
              variants.find((v) => v.id === item.variantId)!
            ),
          })),
        },
        { status: 409 }
      );
    }

    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanName = typeof name === "string" ? name.trim().slice(0, 120) : "";
    const cleanAddress = typeof address === "string" ? address.trim().slice(0, 200) : "";
    const cleanCity = typeof city === "string" ? city.trim().slice(0, 100) : "";

    // L'email serve per la ricevuta e per la conferma d'ordine: senza un
    // indirizzo valido l'ordine resterebbe orfano e il cliente non riceverebbe
    // nulla (prima veniva accettata anche una stringa vuota o "abc").
    if (
      cleanEmail.length === 0 ||
      cleanEmail.length > 254 ||
      !EMAIL_PATTERN.test(cleanEmail)
    ) {
      return NextResponse.json(
        { error: "Inserisci un indirizzo email valido per la conferma d'ordine." },
        { status: 400 }
      );
    }

    if (!cleanName || !cleanAddress || !cleanCity) {
      return NextResponse.json(
        { error: "Nome, indirizzo e città sono obbligatori per la spedizione." },
        { status: 400 }
      );
    }

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
              display_name: getShippingLabel(shippingCostCents),
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
          : "Non è stato possibile avviare il pagamento. Riprova tra poco o contatta l'assistenza.",
      },
      { status: 500 }
    );
  }
}
