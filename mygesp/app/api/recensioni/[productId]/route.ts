import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  if (!productId || productId.length > 64) {
    return NextResponse.json([]);
  }

  try {
    // Rimossi i dati sensibili del cliente (email e nome) per prevenire il leak
    // Ora restituiamo solo i dati della recensione
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: {
        id: true,
        comment: true,
        rating: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(reviews);
  } catch (err) {
    console.error("Errore recupero recensioni:", err);
    return NextResponse.json(
      { error: "Errore durante il recupero delle recensioni" },
      { status: 500 }
    );
  }
}