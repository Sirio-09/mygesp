import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/prodotti
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const isFeatured = searchParams.get("featured") === "true";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // 1. Cerca i prodotti (filtrando per featured se richiesto)
    let products = await prisma.product.findMany({
      where: isFeatured ? { featured: true } : {},
      include: {
        variants: {
          take: 1,
          select: {
            priceCents: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // 2. Fallback: Se si chiedono quelli in evidenza ma non ce n'è nessuno nel DB,
    // prende gli ultimi inseriti per evitare di mostrare un blocco vuoto
    if (isFeatured && products.length === 0) {
      products = await prisma.product.findMany({
        include: {
          variants: {
            take: 1,
            select: {
              priceCents: true,
            },
          },
        },
        take: limit || 2,
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(products);
  } catch (err: any) {
    console.error("Errore recupero prodotti:", err);
    return NextResponse.json(
      { error: "Errore durante il recupero dei prodotti" },
      { status: 500 }
    );
  }
}

// POST /api/prodotti (Riservato agli admin)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const isFeatured = body.featured === true || body.featured === "true";

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        shortTitle: body.shortTitle || null,
        shortDescription: body.shortDescription || null,
        descriptionBlocks: body.descriptionBlocks,
        brand: body.brand,
        category: body.category,
        activities: [],
        images: body.images ?? [],
        waterColumn: body.waterColumn ? parseInt(body.waterColumn) : null,
        minTemp: body.minTemp ? parseInt(body.minTemp) : null,
        featured: isFeatured,
        discountPercent: body.discountPercent ? parseInt(body.discountPercent) : null,
        discountUntil: body.discountUntil ? new Date(body.discountUntil) : null,
        variants: {
          create: (body.variants || []).map(
            (v: { size: string; sku: string; priceCents: string; stock: string }) => ({
              size: v.size,
              sku: v.sku,
              priceCents: parseInt(v.priceCents || "0"),
              stock: parseInt(v.stock || "0"),
            })
          ),
        },
      },
    });
    return NextResponse.json(product);
  } catch (err: any) {
    console.error("Errore salvataggio prodotto:", err);
    return NextResponse.json(
      { error: err.message || "Errore salvataggio" },
      { status: 500 }
    );
  }
}