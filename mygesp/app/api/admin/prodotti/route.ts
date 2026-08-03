import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  const body = await req.json()

  try {
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        brand: body.brand,
        category: body.category,
        activities: [],
        images: [],
        waterColumn: body.waterColumn ? parseInt(body.waterColumn) : null,
        minTemp: body.minTemp ? parseInt(body.minTemp) : null,
        variants: {
          create: [{
            size: body.size,
            sku: body.sku,
            priceCents: parseInt(body.priceCents),
            stock: parseInt(body.stock)
          }]
        }
      }
    })
    return NextResponse.json(product)
  } catch (err) {
    return NextResponse.json({ error: "Errore salvataggio" }, { status: 500 })
  }
}