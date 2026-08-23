import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    const oldMinPrice = existingProduct
      ? Math.min(...existingProduct.variants.map((v) => v.priceCents))
      : null;

    await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        descriptionBlocks: body.descriptionBlocks,
        brand: body.brand,
        category: body.category,
        images: body.images ?? [],
        waterColumn: body.waterColumn ? parseInt(body.waterColumn) : null,
        minTemp: body.minTemp ? parseInt(body.minTemp) : null,
        featured: Boolean(body.featured),
        discountPercent: body.discountPercent ? parseInt(body.discountPercent) : 0,
        discountUntil: body.discountUntil ? new Date(body.discountUntil) : null,
      },
    });

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

    // Invalida la cache di Next.js per aggiornare istantaneamente Homepage, Catalogo e Pagina Prodotto
    revalidatePath("/", "layout");

    const newMinPrice = Math.min(
      ...body.variants.map((v: { priceCents: string }) => parseInt(v.priceCents))
    );

    if (oldMinPrice !== null && newMinPrice < oldMinPrice && process.env.RESEND_API_KEY) {
      const subscribers = await prisma.newsletterSubscriber.findMany();

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
    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    // Invalida la cache per rimuovere il prodotto eliminato da tutte le pagine
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Errore eliminazione prodotto:", err);
    return NextResponse.json({ error: "Errore eliminazione" }, { status: 500 });
  }
}