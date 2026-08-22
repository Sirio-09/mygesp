import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'

export const revalidate = 60 // Rigenera ogni minuto per dati aggiornati

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      include: {
        variants: true,
      },
      take: 8,
    })
    return products
  } catch (error) {
    console.error('Errore durante il recupero dei prodotti in evidenza:', error)
    return []
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="space-y-12 md:space-y-16 pb-16">
      {/* HERO SECTION HIGH-CONVERSION */}
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
            <p className="text-base sm:text-lg text-ink-soft max-w-2xl mx-auto lg:mx-0 font-normal">
              Resistenza estrema e protezione dalle intemperie. Scopri la gamma con brand di punta come <strong className="text-ink">Uragan-Tex</strong> e <strong className="text-ink">Bisont</strong>.
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

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-paper border border-line rounded-xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-soil">Garantito da MyGesp</span>
                <span className="text-xs text-ink-soft font-semibold">Reso 14 Giorni</span>
              </div>
              <ul className="space-y-3 text-sm text-ink">
                <li className="flex items-start gap-2">
                  <span className="text-grass font-bold">✓</span>
                  <span><strong>Impermeabilità Totale:</strong> Progettati per la pioggia battevole e ambienti umidi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-grass font-bold">✓</span>
                  <span><strong>Isolamento Termico:</strong> Protezione dalle basse temperature invernali.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-grass font-bold">✓</span>
                  <span><strong>Spedizione Rapida:</strong> Consegna diretta in azienda o a casa.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-paper border border-line rounded-lg shadow-xs">
          <div className="flex flex-col items-center text-center p-2">
            <span className="text-2xl mb-1">🚚</span>
            <span className="font-bold text-xs uppercase tracking-wider text-ink">Spedizione Rapida</span>
            <span className="text-xs text-ink-soft">Consegna in 24/48 ore</span>
          </div>
          <div className="flex flex-col items-center text-center p-2">
            <span className="text-2xl mb-1">🔒</span>
            <span className="font-bold text-xs uppercase tracking-wider text-ink">Pagamenti Sicuri</span>
            <span className="text-xs text-ink-soft">Carte & Stripe con SSL</span>
          </div>
          <div className="flex flex-col items-center text-center p-2">
            <span className="text-2xl mb-1">🧪</span>
            <span className="font-bold text-xs uppercase tracking-wider text-ink">Testati sul Campo</span>
            <span className="text-xs text-ink-soft">Testati in stalla e fango</span>
          </div>
          <div className="flex flex-col items-center text-center p-2">
            <span className="text-2xl mb-1">📞</span>
            <span className="font-bold text-xs uppercase tracking-wider text-ink">Supporto Diretto</span>
            <span className="text-xs text-ink-soft">Assistenza telefonica/email</span>
          </div>
        </div>
      </section>

      {/* CATEGORIE PRINCIPALI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-line pb-4 gap-2">
          <div>
            <h2 className="text-2xl font-black text-ink uppercase tracking-tight">Categorie Principali</h2>
            <p className="text-sm text-ink-soft">Trova subito la protezione adatta al tuo lavoro.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Abbigliamento Impermeabile', desc: 'Giacche e salopette resistenti', href: '/categoria/abbigliamento', badge: 'Uragan-Tex' },
            { title: 'Stivali Termici', desc: 'Isolamento da freddo e fango', href: '/categoria/stivali', badge: 'Bisont' },
            { title: 'Attrezzature & Accessori', desc: 'Utensili da lavoro professionali', href: '/categoria/attrezzature', badge: 'Professionale' },
          ].map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="group relative bg-paper-warm border border-line rounded-lg p-6 hover:border-grass hover:shadow-md transition-all flex flex-col justify-between h-48"
            >
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-paper border border-line text-soil font-bold text-xs uppercase rounded mb-3">
                  {cat.badge}
                </span>
                <h3 className="text-xl font-bold text-ink uppercase group-hover:text-grass transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-ink-soft mt-1">{cat.desc}</p>
              </div>
              <div className="flex items-center text-xs font-bold uppercase tracking-wider text-grass group-hover:translate-x-1 transition-transform">
                Esplora categoria →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PRODOTTI IN EVIDENZA GRID */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="text-2xl font-black text-ink uppercase tracking-tight">Prodotti In Evidenza</h2>
              <p className="text-sm text-ink-soft">I più scelti dai professionisti del settore.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product: any) => {
              const minPriceCents = product.variants && product.variants.length > 0
                ? Math.min(...product.variants.map((v: any) => v.priceCents))
                : 0
              const formattedPrice = (minPriceCents / 100).toFixed(2)
              const hasDiscount = product.discountPercent && product.discountPercent > 0
              const discountedPrice = hasDiscount
                ? ((minPriceCents * (100 - product.discountPercent!)) / 10000).toFixed(2)
                : formattedPrice

              return (
                <div
                  key={product.id}
                  className="bg-paper border border-line rounded-lg overflow-hidden flex flex-col hover:border-grass hover:shadow-md transition-all"
                >
                  <Link href={`/prodotto/${product.slug}`} className="relative aspect-square bg-paper-warm block overflow-hidden">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover object-center hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs uppercase">
                        Nessuna immagine
                      </div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-2 right-2 bg-soil text-paper font-bold text-xs px-2 py-1 rounded shadow-xs uppercase">
                        -{product.discountPercent}%
                      </span>
                    )}
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block mb-1">
                        {product.brand}
                      </span>
                      <Link href={`/prodotto/${product.slug}`} className="font-bold text-ink text-base hover:text-grass line-clamp-2 uppercase">
                        {product.name}
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-line flex items-center justify-between">
                      <div>
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-soil">€{discountedPrice}</span>
                            <span className="text-xs text-ink-soft line-through">€{formattedPrice}</span>
                          </div>
                        ) : (
                          <span className="text-lg font-black text-ink">€{formattedPrice}</span>
                        )}
                      </div>

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

      {/* BANNER ASSISTENZA & GARANZIA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-paper-warm border border-line rounded-xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl font-bold uppercase tracking-tight text-ink">
              Serve aiuto nella scelta della taglia o del modello?
            </h3>
            <p className="text-sm text-ink-soft">
              Il nostro supporto clienti è attivo per consigliarti il prodotto ideale per le tue esigenze di lavoro.
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