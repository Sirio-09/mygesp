import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
    }

    const oldMinPrice =
      existingProduct.variants.length > 0
        ? Math.min(...existingProduct.variants.map((v) => v.priceCents))
        : null;

    const isFeatured = body.featured === true || body.featured === "true";

    await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        shortTitle: body.shortTitle || null,
        shortDescription: body.shortDescription || null,
        descriptionBlocks: body.descriptionBlocks,
        brand: body.brand,
        category: body.category,
        images: body.images ?? [],
        waterColumn: body.waterColumn ? parseInt(body.waterColumn) : null,
        minTemp: body.minTemp ? parseInt(body.minTemp) : null,
        featured: isFeatured,
        discountPercent: body.discountPercent ? parseInt(body.discountPercent) : 0,
        discountUntil: body.discountUntil ? new Date(body.discountUntil) : null,
      },
    });

    const existingVariants = existingProduct.variants;
    const incomingVariants = body.variants || [];

    const incomingIds = incomingVariants.map((v: { id?: string }) => v.id).filter(Boolean);
    const incomingSkus = incomingVariants.map((v: { sku: string }) => v.sku).filter(Boolean);

    const variantsToDelete = existingVariants.filter(
      (v) => !incomingIds.includes(v.id) && !incomingSkus.includes(v.sku)
    );

    for (const variant of variantsToDelete) {
      const orderCount = await prisma.orderItem.count({
        where: { variantId: variant.id },
      });

      if (orderCount === 0) {
        if ("cartItem" in prisma) {
          await (prisma as any).cartItem.deleteMany({
            where: { variantId: variant.id },
          });
        }
        await prisma.variant.delete({ where: { id: variant.id } });
      } else {
        await prisma.variant.update({
          where: { id: variant.id },
          data: { stock: 0 },
        });
      }
    }

    for (const v of incomingVariants) {
      const priceCents = parseInt(v.priceCents || "0");
      const stock = parseInt(v.stock || "0");

      const existingBySku = v.sku
        ? await prisma.variant.findUnique({ where: { sku: v.sku } })
        : null;

      const targetId = v.id || existingBySku?.id;

      if (targetId) {
        await prisma.variant.update({
          where: { id: targetId },
          data: {
            productId: id,
            size: v.size,
            sku: v.sku,
            priceCents,
            stock,
          },
        });
      } else {
        await prisma.variant.create({
          data: {
            productId: id,
            size: v.size,
            sku: v.sku,
            priceCents,
            stock,
          },
        });
      }
    }

    revalidatePath("/", "layout");

    const newMinPrice =
      incomingVariants.length > 0
        ? Math.min(...incomingVariants.map((v: { priceCents: string }) => parseInt(v.priceCents)))
        : 0;

    if (oldMinPrice !== null && newMinPrice < oldMinPrice && process.env.RESEND_API_KEY) {
      const subscribers = await prisma.newsletter.findMany();

      if (subscribers.length > 0) {
        for (const subscriber of subscribers) {
          await resend.emails.send({
            from: "MyGesp <onboarding@resend.dev>",
            to: subscriber.email,
            subject: `Sconto su ${body.name}`,
            html: `
              <h2>${body.name} ora costa meno</h2>
              <p>Prezzo precedente: €${(oldMinPrice / 100).toFixed(2)}</p>
              <p>Nuovo prezzo: €${(newMinPrice / 100).toFixed(2)}</p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/prodotto/${body.slug}">Vai al prodotto</a></p>
            `,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Errore aggiornamento prodotto:", err);
    return NextResponse.json({ error: err.message || "Errore salvataggio" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      const variants = await tx.variant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const variantIds = variants.map((v) => v.id);

      if (variantIds.length > 0) {
        await tx.orderItem.deleteMany({
          where: { variantId: { in: variantIds } },
        });

        if ("cartItem" in tx) {
          await (tx as any).cartItem.deleteMany({
            where: { variantId: { in: variantIds } },
          });
        }

        await tx.variant.deleteMany({
          where: { productId: id },
        });
      }

      await tx.review.deleteMany({
        where: { productId: id },
      });

      await tx.product.delete({
        where: { id },
      });
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Errore eliminazione definitiva prodotto:", err);
    return NextResponse.json(
      { error: err.message || "Errore durante l'eliminazione" },
      { status: 500 }
    );
  }
}