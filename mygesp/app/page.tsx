import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'

export const revalidate = 60

async function getHomePageData() {
  try {
    const featuredProducts = await prisma.product.findMany({
      where: { featured: true },
      include: { variants: true },
      take: 8,
    })
    return { featuredProducts }
  } catch (error) {
    console.error('Errore durante il recupero dei dati home:', error)
    return { featuredProducts: [] }
  }
}

export default async function HomePage() {
  const { featuredProducts } = await getHomePageData()

  return (
    <div className="space-y-16 pb-16">
      <section className="relative bg-paper-warm border-b border-line py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight uppercase">
              Abbigliamento e Stivali <br />
              <span className="text-grass">Professionali da Lavoro</span>
            </h1>
            <p className="text-base sm:text-lg text-ink-soft max-w-2xl mx-auto lg:mx-0">
              Resistenza estrema e isolamento totale per chi lavora ogni giorno all'aperto.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/categoria/abbigliamento"
                className="w-full sm:w-auto px-8 py-4 bg-grass hover:bg-grass-deep text-paper font-bold rounded-md shadow-md hover:shadow-lg transition-all text-center uppercase tracking-wide text-sm"
              >
                Scopri l'Abbigliamento
              </Link>
              <Link
                href="/categoria/stivali"
                className="w-full sm:w-auto px-8 py-4 bg-paper border-2 border-ink text-ink hover:bg-paper-warm font-bold rounded-md transition-colors text-center uppercase tracking-wide text-sm"
              >
                Stivali Termici
              </Link>
            </div>
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="text-2xl font-black text-ink uppercase tracking-tight">Prodotti in Evidenza</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product: any) => {
              const minPriceCents = product.variants && product.variants.length > 0
                ? Math.min(...product.variants.map((v: any) => v.priceCents))
                : 0
              const formattedPrice = (minPriceCents / 100).toFixed(2)

              return (
                <div
                  key={product.id}
                  className="bg-paper border border-line rounded-lg overflow-hidden flex flex-col hover:border-grass transition-all"
                >
                  <Link href={`/prodotto/${product.slug}`} className="relative aspect-square bg-paper-warm block">
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
                      <Link href={`/prodotto/${product.slug}`} className="font-bold text-ink text-sm hover:text-grass line-clamp-2 uppercase">
                        {product.name}
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-line flex items-center justify-between">
                      <span className="text-lg font-black text-ink">€{formattedPrice}</span>
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
        </section>
      )}
    </div>
  )
}