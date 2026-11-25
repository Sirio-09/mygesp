import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {
  parseProductInput,
  toFriendlyPrismaError,
  type RawProductInput,
} from "@/lib/product-input";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

// GET /api/admin/prodotti — elenco prodotti per il pannello di gestione
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

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

    let products = await prisma.product.findMany({
      where: isFeatured ? { featured: true } : {},
      include,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

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

// POST /api/admin/prodotti — creazione prodotto
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

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
