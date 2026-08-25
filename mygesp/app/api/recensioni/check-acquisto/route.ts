import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  
  // Se non è loggato o non è un cliente, blocchiamo la richiesta
  if (!session || (session.user as { role?: string })?.role !== "customer") {
    return NextResponse.json({ hasPurchased: false });
  }

  // Estraiamo productId direttamente da req.nextUrl
  const productId = req.nextUrl.searchParams.get("productId");
  const customerId = (session.user as { id: string }).id;

  if (!productId) {
    return NextResponse.json({ hasPurchased: false });
  }

  const hasPurchased = await prisma.order.findFirst({
    where: {
      customerId,
      status: "paid",
      items: {
        some: {
          variant: { productId },
        },
      },
    },
  });

  return NextResponse.json({ hasPurchased: !!hasPurchased });
}