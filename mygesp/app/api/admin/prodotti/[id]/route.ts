import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    // aggiorna i dati base del prodotto
    await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        brand: body.brand,
        category: body.category,
        images: body.images ?? [],
        waterColumn: body.waterColumn ? parseInt(body.waterColumn) : null,
        minTemp: body.minTemp ? parseInt(body.minTemp) : null,
      },
    });

    // elimina le varianti esistenti e ricrea quelle inviate — più semplice
    // che calcolare quali aggiungere/modificare/rimuovere una per una
    await prisma.variant.deleteMany({ where: { productId: id } });
    await prisma.variant.createMany({
      data: body.variants.map((v: { size: string; sku: string; priceCents: string; stock: string }) => ({
        productId: id,
        size: v.size,
        sku: v.sku,
        priceCents: parseInt(v.priceCents),
        stock: parseInt(v.stock),
      })),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Errore aggiornamento prodotto:", err);
    return NextResponse.json({ error: "Errore salvataggio" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.variant.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Errore eliminazione prodotto:", err);
    return NextResponse.json({ error: "Errore eliminazione" }, { status: 500 });
  }
}