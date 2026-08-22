import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'

export const revalidate = 60 // Rigenera ogni 60 secondi

async function getHomePageData() {
  try {
    // 1. Recupera 4 prodotti in primo piano che hanno uno sconto attivo
    const discountedProducts = await prisma.product.findMany({
      where: {
        discountPercent: {
          gt: 0,
        },
      },
      include: { variants: true },
      take: 4,
    })

    // 2. Recupera gli altri prodotti in evidenza se necessario
    const featuredProducts = await prisma.product.findMany({
      where: { featured: true },
      include: { variants: true },
      take: 8,
    })

    return { discountedProducts, featuredProducts }
  } catch (error) {
    console.error('Errore durante il recupero dei dati home:', error)
    return { discountedProducts: [], featuredProducts: [] }
  }
}

// Fallback fittizio per garantire la resa visiva dei 4 primi piani in sconto qualora il DB sia vuoto
const MOCK_DISCOUNTED = [
  {
    id: 'mock-1',
    slug: 'stivali-bisont-arctic',
    name: 'Stivali Termici Bisont Arctic -30°C',
    brand: 'Bisont',
    discountPercent: 20,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'],
    variants: [{ priceCents: 8990, stock: 10 }],
  },
  {
    id: 'mock-2',
    slug: 'giacca-uragan-heavy',
    name: 'Giacca Impermeabile Uragan Heavy Duty',
    brand: 'Uragan-Tex',
    discountPercent: 15,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'],
    variants: [{ priceCents: 12900, stock: 15 }],
  },
  {
    id: 'mock-3',
    slug: 'salopette-pro-anti-strappo',
    name: 'Salopette Professionale Anti-Strappo',
    brand: 'Uragan-Tex',
    discountPercent: 25,
    images: ['https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80'],
    variants: [{ priceCents: 7500, stock: 8 }],
  },
  {
    id: 'mock-4',
    slug: 'guanti-lavoro-estremo',
    name: 'Guanti da Lavoro Termici Impermeabili',
    brand: 'MyGesp Pro',
    discountPercent: 30,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'],
    variants: [{ priceCents: 2990, stock: 20 }],
  },
]

export default async function HomePage() {
  const { discountedProducts, featuredProducts } = await getHomePageData()

  // Usa i prodotti reali scontati se disponibili, altrimenti mostra i mock
  const promoItems = discountedProducts.length >= 4 ? discountedProducts : MOCK_DISCOUNTED

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative bg-paper-warm border-b border-line py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-grass/10 border border-grass/30 rounded-full text-grass-deep text-xs font-bold uppercase tracking-wider">
              <span>✓ Testati in Stalla, Pascolo e Fango</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight uppercase">
              Abbigliamento e Stivali <br />
              <span className="text-grass">Professionali da Lavoro</span>
            </h1>
            <p className="text-base sm:text-lg text-ink-soft max-w-2xl mx-auto lg:mx-0">
              Resistenza estrema e isolamento totale per chi lavora ogni giorno all'aperto nelle condizioni più dure.
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
                Stivali Termici Bisont
              </Link>
            </div>
          </div>

          {/* FOTO REALE DI COPERTINA */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden border-2 border-line shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80"
                alt="Lavoro reale nei campi e stalle"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-paper">
                <span className="bg-grass text-paper font-black text-[10px] px-2 py-1 rounded w-max uppercase tracking-wider mb-1">
                  Realtà del campo
                </span>
                <p className="font-bold text-sm">Resistenza garantita su fango, pioggia e neve.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRIMI PIANI: 4 PRODOTTI IN SCONTO IMPERDIBILI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-line pb-4 gap-2">
          <div>
            <span className="text-xs font-black uppercase text-soil tracking-wider block">Occasioni a Tempo Limitato</span>
            <h2 className="text-2xl sm:text-3xl font-black text-ink uppercase tracking-tight">
              4 Primi Piani in Sconto
            </h2>
          </div>
          <p className="text-xs text-ink-soft">Prezzi speciali riservati ai professionisti del settore</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {promoItems.map((product: any) => {
            const minPriceCents = product.variants && product.variants.length > 0
              ? Math.min(...product.variants.map((v: any) => v.priceCents))
              : 0
            const fullPrice = (minPriceCents / 100).toFixed(2)
            const discountedPrice = (
              (minPriceCents * (100 - product.discountPercent)) /
              10000
            ).toFixed(2)

            return (
              <div
                key={product.id}
                className="bg-paper border-2 border-soil/30 rounded-xl overflow-hidden flex flex-col hover:border-soil shadow-sm hover:shadow-md transition-all relative group"
              >
                {/* Badge Sconto in primo piano */}
                <div className="absolute top-3 left-3 z-10 bg-soil text-paper font-black text-xs px-2.5 py-1 rounded shadow-md uppercase tracking-wider">
                  -{product.discountPercent}% OFF
                </div>

                <Link href={`/prodotto/${product.slug}`} className="relative aspect-square bg-paper-warm block overflow-hidden">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs uppercase">
                      Immagine non disponibile
                    </div>
                  )}
                </Link>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                      {product.brand}
                    </span>
                    <Link href={`/prodotto/${product.slug}`} className="font-black text-ink text-base hover:text-grass line-clamp-2 uppercase">
                      {product.name}
                    </Link>
                  </div>

                  <div className="pt-3 border-t border-line flex items-center justify-between">
                    <div>
                      <div className="text-xs text-ink-soft line-through">€{fullPrice}</div>
                      <div className="text-xl font-black text-soil">€{discountedPrice}</div>
                    </div>

                    <Link
                      href={`/prodotto/${product.slug}`}
                      className="px-4 py-2 bg-soil hover:bg-ink text-paper text-xs font-bold rounded uppercase transition-colors"
                    >
                      Approfitta
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. SEZIONE FOTO REALI & TESTATO SUL CAMPO */}
      <section className="bg-paper-warm border-y border-line py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-ink uppercase tracking-tight">
              Dalla Terra al Cantiere: Storie Reali
            </h2>
            <p className="text-sm text-ink-soft">
              Nessun set fotografico patinato: i nostri prodotti vivono e lavorano dove serve davvero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Foto 1: Stalla */}
            <div className="bg-paper border border-line rounded-xl overflow-hidden shadow-xs flex flex-col">
              <div className="relative h-56 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=800&q=80"
                  alt="Lavoro quotidiano in stalla"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 flex-1 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-grass">Azienda Agricola Mantovana</span>
                <h3 className="font-bold text-ink text-base uppercase">Resistenza agli acidi di stalla</h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  "Utilizziamo gli stivali Bisont da oltre 8 mesi tra pulizia stalle e fango. La suola non cede e i piedi restano asciutti e caldi anche alle 5 del mattino."
                </p>
              </div>
            </div>

            {/* Foto 2: Campo aperto */}
            <div className="bg-paper border border-line rounded-xl overflow-hidden shadow-xs flex flex-col">
              <div className="relative h-56 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80"
                  alt="Lavoro sul campo sotto la pioggia"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 flex-1 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-grass">Coltivazioni Risaie Vercelli</span>
                <p className="font-bold text-ink text-base uppercase">Impermeabilità Uragan-Tex</p>
                <p className="text-xs text-ink-soft leading-relaxed">
                  "Sotto la pioggia battente la giacca non assorbe una goccia d'acqua. Le cuciture nastrate fanno la differenza durante le lunghe giornate nei campi."
                </p>
              </div>
            </div>

            {/* Foto 3: Cantieri ed estivi */}
            <div className="bg-paper border border-line rounded-xl overflow-hidden shadow-xs flex flex-col">
              <div className="relative h-56 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
                  alt="Manutenzione e cantiere"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 flex-1 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-grass">Manutenzione Verde & Cantieri</span>
                <p className="font-bold text-ink text-base uppercase">Tessuti Anti-Strappo</p>
                <p className="text-xs text-ink-soft leading-relaxed">
                  "I pantaloni resistono a rovi e sfregamenti continui. I rinforzi sui ginocchi evitano che il tessuto si consumi al primo mese."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODOTTI IN EVIDENZA GENERALI */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="text-2xl font-black text-ink uppercase tracking-tight">Catalogo In Evidenza</h2>
              <p className="text-sm text-ink-soft">Tutti i prodotti pronti alla spedizione.</p>
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

      {/* 5. GARANZIE & TRUST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-paper border border-line rounded-xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl font-bold uppercase tracking-tight text-ink">
              Serve aiuto per scegliere la taglia o l'attrezzatura giusta?
            </h3>
            <p className="text-sm text-ink-soft">
              Parla direttamente con chi conosce il lavoro di campo. Ti aiuteremo a trovare la misura perfetta al primo colpo.
            </p>
          </div>
          <Link
            href="/cerca"
            className="px-6 py-3 bg-ink hover:bg-grass text-paper font-bold rounded-md transition-colors text-xs uppercase tracking-wider shrink-0"
          >
            Cerca nel Catalogo
          </Link>
        </div>
      </section>
    </div>
  )
}