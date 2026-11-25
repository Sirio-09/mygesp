import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/prodotti — catalogo pubblico (usato dal menu mobile e dalla vetrina).
// La creazione/modifica passa solo da /api/admin/prodotti, che è protetta dal
// guard (password + 2FA); qui il vecchio POST duplicato è stato rimosso.
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
