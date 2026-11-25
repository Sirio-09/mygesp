import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const MAX_COMMENT_LENGTH = 1000;

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

  const cleanComment = typeof comment === "string" ? comment.trim() : "";

  if (
    typeof productId !== "string" ||
    productId.length === 0 ||
    productId.length > 64 ||
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    cleanComment.length === 0 ||
    cleanComment.length > MAX_COMMENT_LENGTH
  ) {
    return NextResponse.json(
      {
        error: `Dati non validi: il commento deve contenere da 1 a ${MAX_COMMENT_LENGTH} caratteri e il voto essere un intero da 1 a 5.`,
      },
      { status: 400 }
    );
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
      data: { productId, customerId, rating, comment: cleanComment },
    });
    return NextResponse.json(review);
  } catch {
    return NextResponse.json(
      { error: "Hai già recensito questo prodotto" },
      { status: 400 }
    );
  }
}