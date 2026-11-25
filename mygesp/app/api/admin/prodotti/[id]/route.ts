import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  parseProductInput,
  toFriendlyPrismaError,
  type RawProductInput,
} from "@/lib/product-input";
import { sendEmail, isEmailConfigured } from "@/lib/resend";
import { getSiteUrl } from "@/lib/stripe";
import { formatEuro } from "@/lib/site";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

/**
 * Notifica gli iscritti alla newsletter quando il prezzo minimo scende.
 * L'invio è "best effort": eventuali errori non bloccano il salvataggio.
 */
async function notifyPriceDrop(
  productName: string,
  slug: string,
  oldMinPrice: number,
  newMinPrice: number
) {
  if (!isEmailConfigured() || newMinPrice >= oldMinPrice) return;

  const subscribers = await prisma.newsletter.findMany({
    select: { email: true },
  });

  if (subscribers.length === 0) return;

  const productUrl = `${getSiteUrl()}/prodotto/${slug}`;

  const results = await Promise.all(
    subscribers.map((subscriber) =>
      sendEmail({
        to: subscriber.email,
        subject: `Sconto su ${productName}`,
        html: `
          <h2>${productName} ora costa meno</h2>
          <p>Prezzo precedente: ${formatEuro(oldMinPrice)}</p>
          <p>Nuovo prezzo: ${formatEuro(newMinPrice)}</p>
          <p><a href="${productUrl}">Vai al prodotto</a></p>
        `,
      })
    )
  );

  const failed = results.filter((result) => !result.ok).length;

  if (failed > 0) {
    console.warn(
      `Notifica calo prezzo: ${failed}/${results.length} email non inviate.`
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  try {
    const variants = await prisma.variant.findMany({
      where: { productId: id },
      select: { id: true },
    });
    const variantIds = variants.map((variant) => variant.id);

    // Non cancelliamo mai righe d'ordine: perderemmo lo storico fiscale.
    if (variantIds.length > 0) {
      const orderItemsCount = await prisma.orderItem.count({
        where: { variantId: { in: variantIds } },
      });

      if (orderItemsCount > 0) {
        return NextResponse.json(
          {
            error:
              "Questo prodotto compare in ordini esistenti e non può essere eliminato senza perdere lo storico. Imposta le giacenze a 0 e togli la spunta \"In evidenza\" per nasconderlo dal catalogo.",
          },
          { status: 409 }
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { productId: id } });
      await tx.variant.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Errore eliminazione definitiva prodotto:", err);
    return NextResponse.json(
      { error: toFriendlyPrismaError(err) },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  let body: RawProductInput;
  try {
    body = (await req.json()) as RawProductInput;
  } catch {
    return NextResponse.json({ error: "Payload JSON non valido" }, { status: 400 });
  }

  const parsed = parseProductInput(body);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
    }

    const oldMinPrice =
      existing.variants.length > 0
        ? Math.min(...existing.variants.map((v) => v.priceCents))
        : null;

    // Uno SKU è unico a livello globale: blocchiamo il riuso da parte di altri prodotti
    // invece di "spostare" silenziosamente la variante (bug precedente).
    const incomingSkus = parsed.variants.map((v) => v.sku);
    const conflictingVariants = await prisma.variant.findMany({
      where: { sku: { in: incomingSkus }, productId: { not: id } },
      select: { sku: true },
    });

    if (conflictingVariants.length > 0) {
      return NextResponse.json(
        {
          error: `SKU già usati da altri prodotti: ${conflictingVariants
            .map((v) => v.sku)
            .join(", ")}`,
        },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: parsed.data });

      const existingById = new Map(existing.variants.map((v) => [v.id, v]));
      const existingBySku = new Map(existing.variants.map((v) => [v.sku, v]));
      const keptIds = new Set<string>();

      for (const variant of parsed.variants) {
        const match =
          (variant.id ? existingById.get(variant.id) : undefined) ??
          existingBySku.get(variant.sku);

        if (match) {
          await tx.variant.update({
            where: { id: match.id },
            data: {
              size: variant.size,
              sku: variant.sku,
              priceCents: variant.priceCents,
              stock: variant.stock,
            },
          });
          keptIds.add(match.id);
        } else {
          const created = await tx.variant.create({
            data: {
              productId: id,
              size: variant.size,
              sku: variant.sku,
              priceCents: variant.priceCents,
              stock: variant.stock,
            },
          });
          keptIds.add(created.id);
        }
      }

      // Varianti rimosse dal form: eliminabili solo se non compaiono in ordini.
      const variantsToRemove = existing.variants.filter(
        (variant) => !keptIds.has(variant.id)
      );

      for (const variant of variantsToRemove) {
        const orderCount = await tx.orderItem.count({
          where: { variantId: variant.id },
        });

        if (orderCount === 0) {
          await tx.variant.delete({ where: { id: variant.id } });
        } else {
          await tx.variant.update({
            where: { id: variant.id },
            data: { stock: 0 },
          });
        }
      }
    });

    revalidatePath("/", "layout");

    const newMinPrice = Math.min(...parsed.variants.map((v) => v.priceCents));

    if (oldMinPrice !== null) {
      try {
        await notifyPriceDrop(
          parsed.data.name,
          parsed.data.slug,
          oldMinPrice,
          newMinPrice
        );
      } catch (emailErr) {
        console.error("Errore notifica newsletter calo prezzo:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Errore aggiornamento prodotto:", err);
    return NextResponse.json(
      { error: toFriendlyPrismaError(err) },
      { status: 500 }
    );
  }
}
