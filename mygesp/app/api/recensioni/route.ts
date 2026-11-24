import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "customer") {
    return NextResponse.json({ error: "Devi accedere al tuo account per lasciare una recensione" }, { status: 401 });
  }

  let productId: unknown;
  let rating: unknown;
  let comment: unknown;

  try {
    const body = (await req.json()) as {
      productId?: unknown;
      rating?: unknown;
      comment?: unknown;
    };
    productId = body?.productId;
    rating = body?.rating;
    comment = body?.comment;
  } catch {
    return NextResponse.json({ error: "Payload JSON non valido" }, { status: 400 });
  }

  const customerId = (session.user as { id: string }).id;

  if (
    typeof productId !== "string" ||
    typeof rating !== "number" ||
    rating < 1 ||
    rating > 5 ||
    typeof comment !== "string" ||
    !comment.trim()
  ) {
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