import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  
  // Se non è loggato o non è un cliente, diciamo subito no
  if (!session || (session.user as { role?: string })?.role !== "customer") {
    return NextResponse.json({ hasPurchased: false });
  }

  // Prendiamo il productId dall'URL (es: /api/.../check-acquisto?productId=123)
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const customerId = (session.user as { id: string }).id;

  if (!productId) {
    return NextResponse.json({ hasPurchased: false });
  }

  // Usiamo la STESSA identica logica che avevi usato nel tuo POST
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

  // Rispondiamo true se ha trovato l'ordine, false se non lo ha trovato
  return NextResponse.json({ hasPurchased: !!hasPurchased });
}