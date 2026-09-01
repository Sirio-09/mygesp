import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session || (session.user as { role?: string })?.role !== "customer") {
    return NextResponse.json({ hasPurchased: false, hasReviewed: false });
  }

  const productId = req.nextUrl.searchParams.get("productId");
  const customerId = (session.user as { id: string }).id;

  if (!productId) {
    return NextResponse.json({ hasPurchased: false, hasReviewed: false });
  }

  const [hasPurchased, existingReview] = await Promise.all([
    prisma.order.findFirst({
      where: {
        customerId,
        status: "paid",
        items: {
          some: {
            variant: { productId },
          },
        },
      },
    }),
    prisma.review.findUnique({
      where: {
        productId_customerId: { productId, customerId },
      },
    }),
  ]);

  return NextResponse.json({
    hasPurchased: !!hasPurchased,
    hasReviewed: !!existingReview,
  });
}