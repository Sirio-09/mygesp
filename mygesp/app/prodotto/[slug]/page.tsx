import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import ProductGallery from '@/components/product/ProductGallery'
import AddToCartButton from '@/components/product/AddToCartButton'
import ProductReviews from '@/components/product/ProductReviews'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
        reviews: {
          include: {
            customer: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    return product
  } catch (error) {
    console.error('Errore durante il recupero del prodotto:', error)
    return null
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  // Calcolo stock totale
  const totalStock = product.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0)
  const isAvailable = totalStock > 0

  // Calcolo prezzo e sconti
  const minPriceCents = product.variants.length > 0
    ? Math.min(...product.variants.map((v: any) => v.priceCents))
    : 0
  const isDiscounted = !!(product.discountPercent && product.discountPercent > 0)
  const fullPriceEuro = (minPriceCents / 100).toFixed(2)
  const discountedPriceEuro = isDiscounted
    ? ((minPriceCents * (100 - product.discountPercent!)) / 10000).toFixed(2)
    : fullPriceEuro

  // Parsing descrizione a blocchi
  let descriptionBlocks: Array<{ title?: string; text: string }> = []
  if (Array.isArray(product.descriptionBlocks)) {
    descriptionBlocks = product.descriptionBlocks as any
  } else if (typeof product.descriptionBlocks === 'string') {
    try {
      descriptionBlocks = JSON.parse(product.descriptionBlocks)
    } catch {
      descriptionBlocks = [{ text: product.descriptionBlocks }]
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* BREADCRUMB */}
      <nav className="flex items-center space-x-2 text-xs text-ink-soft uppercase font-medium">
        <Link href="/" className="hover:text-grass transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/categoria/${product.category.toLowerCase()}`} className="hover:text-grass transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-ink font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* MAIN PRODUCT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* GALLERIA IMMAGINI (7 colonne) */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images || []} productName={product.name} />
        </div>

        {/* DETTAGLI D'ACQUISTO (5 colonne) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="inline-block px-2.5 py-1 bg-paper-warm border border-line text-soil font-bold text-xs uppercase rounded mb-2">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-ink uppercase tracking-tight leading-snug">
              {product.name}
            </h1>
          </div>

          {/* BOX DISPONIBILITÀ & TEST */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            {isAvailable ? (
              <span className="px-2.5 py-1 bg-grass/10 border border-grass/30 text-grass-deep rounded-md flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-grass animate-pulse" />
                Disponibile in magazzino - Spedizione in 24h
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-red-100 border border-red-200 text-red-700 rounded-md">
                Esaurito temporaneamente
              </span>
            )}
            <span className="px-2.5 py-1 bg-paper-warm border border-line text-ink-soft rounded-md">
              ✓ Testato sul campo
            </span>
          </div>

          {/* PREZZO E SCONTO */}
          <div className="p-4 bg-paper-warm/50 border border-line rounded-lg space-y-1">
            <div className="flex items-baseline gap-3">
              {isDiscounted ? (
                <>
                  <span className="text-3xl font-black text-soil">€{discountedPriceEuro}</span>
                  <span className="text-lg text-ink-soft line-through">€{fullPriceEuro}</span>
                  <span className="px-2 py-0.5 bg-soil text-paper font-bold text-xs rounded uppercase">
                    Risparmi il {product.discountPercent}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-black text-ink">€{fullPriceEuro}</span>
              )}
            </div>
            <p className="text-[11px] text-ink-soft uppercase font-medium">Prezzo IVA inclusa</p>
          </div>

          {/* CARTELLINI TECNICI SPECIFICI */}
          {(product.waterColumn !== null || product.minTemp !== null) && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {product.waterColumn !== null && (
                <div className="p-3 bg-paper border border-line rounded-md text-center">
                  <span className="block text-[10px] font-bold uppercase text-ink-soft">Colonna d'Acqua</span>
                  <span className="text-base font-black text-ink">{product.waterColumn} mm</span>
                </div>
              )}
              {product.minTemp !== null && (
                <div className="p-3 bg-paper border border-line rounded-md text-center">
                  <span className="block text-[10px] font-bold uppercase text-ink-soft">Temp. Minima</span>
                  <span className="text-base font-black text-ink">{product.minTemp}°C</span>
                </div>
              )}
            </div>
          )}

          {/* SELETTORE TAGLIE & PULSANTE ACQUISTO */}
          <div className="pt-2 border-t border-line">
            <AddToCartButton
              variants={product.variants as any}
              productSlug={product.slug}
              productName={product.name}
              discountPercent={product.discountPercent ?? 0}
            />
          </div>

          {/* GARANZIE CRO SOTTO CTA */}
          <div className="space-y-2 pt-4 border-t border-line text-xs text-ink-soft">
            <div className="flex items-center gap-2">
              <span className="text-grass font-bold text-base">✓</span>
              <span>Spedizione rapida tracciata con corriere espresso</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-grass font-bold text-base">✓</span>
              <span>Reso e cambio taglia entro 14 giorni dall'acquisto</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-grass font-bold text-base">✓</span>
              <span>Pagamento sicuro con Carta o Stripe con crittografia SSL</span>
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIZIONE DETTAGLIATA A BLOCCHI */}
      {descriptionBlocks.length > 0 && (
        <section className="bg-paper border border-line rounded-xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-black text-ink uppercase tracking-tight border-b border-line pb-3">
            Descrizione e Scheda Tecnica
          </h2>
          <div className="space-y-6 text-sm leading-relaxed text-ink">
            {descriptionBlocks.map((block, idx) => (
              <div key={idx} className="space-y-2">
                {block.title && (
                  <h3 className="font-bold text-base text-ink uppercase tracking-wide">
                    {block.title}
                  </h3>
                )}
                <p className="text-ink-soft whitespace-pre-line">{block.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SEZIONE RECENSIONI */}
      <section className="bg-paper border border-line rounded-xl p-6 sm:p-8">
        <ProductReviews productId={product.id} />
      </section>
    </div>
  )
}