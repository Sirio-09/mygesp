import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  parseProductInput,
  toFriendlyPrismaError,
  type RawProductInput,
} from "@/lib/product-input";

export const dynamic = "force-dynamic";

// GET /api/prodotti
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const isFeatured = searchParams.get("featured") === "true";
    const limitParam = searchParams.get("limit");
    const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : NaN;
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 60)
        : undefined;

    const include = {
      variants: {
        take: 1,
        select: { priceCents: true },
      },
    } as const;

    // 1. Cerca i prodotti (filtrando per featured se richiesto)
    let products = await prisma.product.findMany({
      where: isFeatured ? { featured: true } : {},
      include,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // 2. Fallback: se si chiedono quelli in evidenza ma non ce n'è nessuno,
    // prendi gli ultimi inseriti per evitare di mostrare un blocco vuoto.
    if (isFeatured && products.length === 0) {
      products = await prisma.product.findMany({
        include,
        take: limit ?? 2,
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(products);
  } catch (err) {
    console.error("Errore recupero prodotti:", err);
    return NextResponse.json(
      { error: "Errore durante il recupero dei prodotti" },
      { status: 500 }
    );
  }
}

// POST /api/prodotti (riservato agli admin)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as RawProductInput;
    const parsed = parseProductInput(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        variants: {
          create: parsed.variants.map((variant) => ({
            size: variant.size,
            sku: variant.sku,
            priceCents: variant.priceCents,
            stock: variant.stock,
          })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("Errore salvataggio prodotto:", err);
    return NextResponse.json(
      { error: toFriendlyPrismaError(err) },
      { status: 500 }
    );
  }
}
