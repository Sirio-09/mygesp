import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "customer") {
    return NextResponse.json({ error: "Devi accedere al tuo account per lasciare una recensione" }, { status: 401 });
  }

  const { productId, rating, comment } = await req.json();
  const customerId = (session.user as { id: string }).id;

  if (!productId || !rating || rating < 1 || rating > 5 || !comment?.trim()) {
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
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

  if (!hasPurchased) {
    return NextResponse.json(
      { error: "Puoi recensire solo prodotti che hai acquistato" },
      { status: 403 }
    );
  }

  try {
    const review = await prisma.review.create({
      data: { productId, customerId, rating, comment: comment.trim() },
    });
    return NextResponse.json(review);
  } catch {
    return NextResponse.json(
      { error: "Hai già recensito questo prodotto" },
      { status: 400 }
    );
  }
}