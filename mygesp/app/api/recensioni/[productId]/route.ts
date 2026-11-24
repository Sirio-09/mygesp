import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

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
  });

  return NextResponse.json(reviews);
}