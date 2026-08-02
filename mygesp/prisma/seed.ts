import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.product.create({
    data: {
      name: 'Giacca Antipioggia Uragan-Tex',
      slug: 'giacca-antipioggia-uragan-tex',
      description: 'Giacca impermeabile a doppio strato per lavoro agricolo.',
      brand: 'Uragan-Tex',
      category: 'abbigliamento',
      activities: ['agricoltura', 'allevamento'],
      images: [],
      waterColumn: 5000,
      variants: {
        create: [
          { size: 'M', sku: 'GIACCA-M', priceCents: 6500, stock: 10 },
          { size: 'L', sku: 'GIACCA-L', priceCents: 6500, stock: 8 },
        ]
      }
    }
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())