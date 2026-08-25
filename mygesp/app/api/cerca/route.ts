import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { shortTitle: { contains: q, mode: "insensitive" } },
          { shortDescription: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      include: {
        variants: true,
      },
    });

    // Mappatura sicura per il frontend della SearchBar
    const formattedProducts = products.map((product) => {
      const productImages = (product as unknown as { images?: string[] }).images;
      const variantWithImage = product.variants?.find(
        (v: unknown) =>
          Array.isArray((v as { images?: string[] }).images) &&
          (v as { images: string[] }).images.length > 0
      ) as { images: string[] } | undefined;

      const mainImage =
        productImages?.[0] ||
        variantWithImage?.images?.[0] ||
        null;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        images: mainImage ? [mainImage] : [],
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Errore durante la ricerca:", error);
    return NextResponse.json(
      { error: "Errore interno durante la ricerca" },
      { status: 500 }
    );
  }
}