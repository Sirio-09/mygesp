import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'

export const revalidate = 60

async function getProducts() {
  try {
    return await prisma.product.findMany({
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Errore caricamento prodotti:', error)
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-line pb-4">
        <h1 className="text-3xl font-black uppercase text-ink tracking-tight">
          Catalogo Prodotti
        </h1>
        <p className="text-xs text-ink-soft uppercase tracking-wider mt-1">
          Abbigliamento e calzature professionali ad alta resistenza
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-ink-soft text-sm uppercase font-medium">
          Nessun prodotto disponibile al momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any) => {
            const minPriceCents =
              product.variants && product.variants.length > 0
                ? Math.min(...product.variants.map((v: any) => v.priceCents))
                : 0
            const formattedPrice = (minPriceCents / 100).toFixed(2)

            return (
              <div
                key={product.id}
                className="bg-paper border border-line rounded-lg overflow-hidden flex flex-col hover:border-grass transition-all"
              >
                <Link
                  href={`/prodotto/${product.slug}`}
                  className="relative aspect-square bg-paper-warm block"
                >
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs uppercase">
                      Nessuna immagine
                    </div>
                  )}
                </Link>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                      {product.brand}
                    </span>
                    <Link
                      href={`/prodotto/${product.slug}`}
                      className="font-bold text-ink text-sm hover:text-grass line-clamp-2 uppercase"
                    >
                      {product.name}
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <span className="text-lg font-black text-ink">
                      €{formattedPrice}
                    </span>
                    <Link
                      href={`/prodotto/${product.slug}`}
                      className="px-3 py-1.5 bg-grass hover:bg-grass-deep text-paper text-xs font-bold rounded uppercase transition-colors"
                    >
                      Vedi
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}