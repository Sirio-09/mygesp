import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        descriptionBlocks: body.descriptionBlocks,
        brand: body.brand,
        category: body.category,
        activities: [],
        images: body.images ?? [],
        waterColumn: body.waterColumn ? parseInt(body.waterColumn) : null,
        minTemp: body.minTemp ? parseInt(body.minTemp) : null,
        variants: {
          create: body.variants.map((v: { size: string; sku: string; priceCents: string; stock: string }) => ({
            size: v.size,
            sku: v.sku,
            priceCents: parseInt(v.priceCents),
            stock: parseInt(v.stock),
          })),
        },
      },
    });
    return NextResponse.json(product);
  } catch (err) {
    console.error("Errore salvataggio prodotto:", err);
    return NextResponse.json({ error: "Errore salvataggio" }, { status: 500 });
  }
}