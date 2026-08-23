import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true },
    take: 8,
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="bg-paper min-h-screen">
      {/* hero */}
      <section className="relative bg-ink overflow-hidden border-b border-line/10">
        {/* Pattern decorativo di sfondo */}
        <div className="absolute inset-0 bg-[radial-gradient(#2d3732_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24 lg:py-32 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-grass/10 border border-grass/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-grass animate-pulse" />
              <p className="text-grass text-xs sm:text-sm font-bold uppercase tracking-wider">
                Uragan-Tex · Bisont
              </p>
            </div>
            
            <h1 className="text-white font-extrabold text-3xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight mb-6">
              Testati in stalla,<br />
              <span className="text-paper-warm/60 font-light">non in laboratorio</span>
            </h1>
            
            <p className="text-paper-warm/80 text-base sm:text-lg max-w-[480px] mb-8 leading-relaxed font-normal">
              Abbigliamento impermeabile e stivali termici per chi lavora ogni giorno tra pioggia, fango e freddo. Scelti da allevatori, non da un catalogo.
            </p>
            
            <Link
              href="/categoria/abbigliamento"
              className="inline-flex items-center justify-center bg-grass hover:bg-grass-deep text-white font-bold text-sm sm:text-base px-8 py-4 transition-all duration-300 shadow-lg hover:shadow-grass/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              Scopri l&apos;abbigliamento tecnico →
            </Link>
          </div>

          {/* Immagine Hero Inquadrata in Verticale */}
          <div className="relative aspect-[4/5] lg:aspect-[3/4] max-h-[550px] w-full mx-auto bg-ink-soft/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl group">
            <Image
              src="/allevatore_che_indossa_giacca_lunga_impermeabile_uragan_tex.jpg"
              alt="Allevatore che indossa giacca lunga impermeabile Uragan-Tex"
              fill
              priority
              className="object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* gamma prodotti (NUOVA SEZIONE NUOVA E MODERNA) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 border-b border-line/60 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-grass-deep/10 text-grass-deep text-xs font-bold uppercase tracking-widest mb-3">
              <span>Collezioni Tecniche</span>
            </div>
            <h2 className="text-ink font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              Equipaggiamento per il lavoro vero
            </h2>
          </div>
          <p className="text-ink-soft text-sm sm:text-base max-w-md font-normal leading-relaxed">
            Seleziona la tua categoria per scoprire i prodotti testati in condizioni estreme sul campo e in stalla.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1 - Abbigliamento */}
          <Link
            href="/categoria/abbigliamento"
            className="group relative bg-white border border-line p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:border-grass-deep hover:shadow-2xl hover:-translate-y-1.5 overflow-hidden"
          >
            {/* Barra superiore colorata in hover */}
            <div className="absolute top-0 left-0 w-full h-1 bg-grass-deep transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-mono text-xs font-bold tracking-widest text-grass-deep bg-grass-deep/10 px-3 py-1.5 rounded-md">
                  01 / IMPERMEABILE
                </span>
                <div className="w-12 h-12 rounded-xl bg-paper-warm flex items-center justify-center text-grass-deep group-hover:bg-grass-deep group-hover:text-white transition-colors duration-300 shadow-sm">
                  {/* Icona Giacca / Mantella */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-ink font-bold text-xl sm:text-2xl mb-3 group-hover:text-grass-deep transition-colors">
                Abbigliamento Tecnico
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed mb-8">
                Giacche ad alta tenacità, salopette e mantelle anti-strappo traspiranti e 100% impermeabili.
              </p>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-ink group-hover:text-grass-deep transition-colors pt-4 border-t border-line/60">
              <span>Esplora la gamma</span>
              <span className="transform group-hover:translate-x-2 transition-transform duration-200">→</span>
            </div>
          </Link>

          {/* Card 2 - Stivali */}
          <Link
            href="/categoria/stivali"
            className="group relative bg-white border border-line p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:border-grass-deep hover:shadow-2xl hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-grass-deep transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-mono text-xs font-bold tracking-widest text-grass-deep bg-grass-deep/10 px-3 py-1.5 rounded-md">
                  02 / CALZATURE
                </span>
                <div className="w-12 h-12 rounded-xl bg-paper-warm flex items-center justify-center text-grass-deep group-hover:bg-grass-deep group-hover:text-white transition-colors duration-300 shadow-sm">
                  {/* Icona Stivale / Protezione */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-ink font-bold text-xl sm:text-2xl mb-3 group-hover:text-grass-deep transition-colors">
                Stivali e Calzature Termiche
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed mb-8">
                Stivali termici e scarponi da lavoro con isolamento dal freddo e suola ad altissimo grip antiscivolo.
              </p>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-ink group-hover:text-grass-deep transition-colors pt-4 border-t border-line/60">
              <span>Scopri i modelli</span>
              <span className="transform group-hover:translate-x-2 transition-transform duration-200">→</span>
            </div>
          </Link>

          {/* Card 3 - Attrezzature */}
          <Link
            href="/categoria/attrezzature"
            className="group relative bg-white border border-line p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:border-grass-deep hover:shadow-2xl hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-grass-deep transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-mono text-xs font-bold tracking-widest text-grass-deep bg-grass-deep/10 px-3 py-1.5 rounded-md">
                  03 / STRUMENTI
                </span>
                <div className="w-12 h-12 rounded-xl bg-paper-warm flex items-center justify-center text-grass-deep group-hover:bg-grass-deep group-hover:text-white transition-colors duration-300 shadow-sm">
                  {/* Icona Attrezzatura / Utensili */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-ink font-bold text-xl sm:text-2xl mb-3 group-hover:text-grass-deep transition-colors">
                Attrezzature e Accessori
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed mb-8">
                Soluzioni professionali robuste pensate per semplificare il lavoro quotidiano in stalla e sul campo.
              </p>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-ink group-hover:text-grass-deep transition-colors pt-4 border-t border-line/60">
              <span>Vedi le attrezzature</span>
              <span className="transform group-hover:translate-x-2 transition-transform duration-200">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* prodotti in evidenza */}
      {featuredProducts.length > 0 && (
        <section className="bg-paper-warm/60 border-y border-line py-16 sm:py-24">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
              <div>
                <p className="text-grass-deep text-xs sm:text-sm font-bold uppercase tracking-widest mb-2">
                  I più scelti
                </p>
                <h2 className="text-ink font-extrabold text-2xl sm:text-4xl tracking-tight">
                  Uragan-Tex &amp; Bisont
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => {
                const minPriceCents =
                  product.variants && product.variants.length > 0
                    ? Math.min(...product.variants.map((v) => v.priceCents))
                    : 0;

                const isDiscountActive = Boolean(
                  product.discountPercent &&
                    product.discountPercent > 0 &&
                    (!product.discountUntil || new Date(product.discountUntil) > new Date())
                );

                const discountedPriceCents = isDiscountActive
                  ? Math.round((minPriceCents * (100 - product.discountPercent!)) / 100)
                  : minPriceCents;

                const formattedPrice = (discountedPriceCents / 100).toFixed(2);
                const formattedFullPrice = (minPriceCents / 100).toFixed(2);

                return (
                  <Link
                    key={product.id}
                    href={`/prodotto/${product.slug}`}
                    className="bg-white block relative overflow-hidden group border border-[#E5E0D8] hover:border-[#80532b]/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Immagine Quadrata con zoom su hover */}
                    <div className="aspect-square bg-white relative w-full overflow-hidden">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs text-center p-3 font-mono">
                          [nessuna foto]
                        </div>
                      )}

                      {/* Badge Sconto Marrone */}
                      {isDiscountActive && (
                        <span className="absolute top-2.5 left-2.5 bg-[#80532b] text-white text-xs font-bold px-2.5 py-1 z-10 shadow-sm">
                          -{product.discountPercent}%
                        </span>
                      )}

                      {/* Badge Colonna d'Acqua */}
                      {product.waterColumn && (
                        <span className="absolute top-2.5 right-2.5 bg-grass-deep text-white text-[10px] font-bold px-2.5 py-1 z-10 shadow-sm">
                          {product.waterColumn}MM
                        </span>
                      )}
                    </div>

                    {/* Dettagli Prodotto */}
                    <div className="p-4 sm:p-5 bg-white border-t border-line/50">
                      <h3 className="text-sm font-bold text-[#1F2925] mb-3 leading-snug line-clamp-2 group-hover:text-grass-deep transition-colors">
                        {product.name}
                      </h3>
                      {product.variants.length > 0 && (
                        <div className="flex items-baseline gap-2 font-mono">
                          {isDiscountActive ? (
                            <>
                              <span className="font-bold text-base text-[#80532b]">
                                €{formattedPrice}
                              </span>
                              <span className="text-xs text-[#7A7A7A] line-through">
                                €{formattedFullPrice}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-base text-[#80532b]">
                              €{formattedPrice}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* perché sceglierci */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <p className="text-grass-deep text-xs sm:text-sm font-bold uppercase tracking-widest mb-3">
            Perché MyGesp
          </p>
          <h2 className="text-ink font-extrabold text-2xl sm:text-4xl tracking-tight">
            Non è marketing, è il lavoro vero
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 border border-line border-t-4 border-t-grass shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-ink font-bold text-lg mb-2">Testati sul campo</h3>
            <p className="text-ink-soft text-sm leading-relaxed">In stalla e al pascolo, non solo in laboratorio.</p>
          </div>
          <div className="bg-white p-6 sm:p-8 border border-line border-t-4 border-t-grass shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-ink font-bold text-lg mb-2">Materiali robusti</h3>
            <p className="text-ink-soft text-sm leading-relaxed">Ad alta tenacità, pensati per durare anni.</p>
          </div>
          <div className="bg-white p-6 sm:p-8 border border-line border-t-4 border-t-grass shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-ink font-bold text-lg mb-2">Assistenza reale</h3>
            <p className="text-ink-soft text-sm leading-relaxed">Da chi lavora ogni giorno nel settore agricolo.</p>
          </div>
          <div className="bg-white p-6 sm:p-8 border border-line border-t-4 border-t-grass shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-ink font-bold text-lg mb-2">Spedizioni rapide</h3>
            <p className="text-ink-soft text-sm leading-relaxed">In tutta Italia e in Europa, imballaggi sicuri.</p>
          </div>
        </div>
      </section>

      {/* social proof */}
      <section className="bg-grass-deep text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10">
          <div className="aspect-[4/3] bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white/60 text-xs sm:text-sm text-center p-6 backdrop-blur-sm shadow-xl font-mono">
            [foto/video: cliente al lavoro con capo Uragan-Tex]
          </div>
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6">
              <p className="text-grass text-xs sm:text-sm font-bold uppercase tracking-wider">
                Testato sul campo
              </p>
            </div>
            <blockquote className="text-white text-xl sm:text-3xl font-medium leading-relaxed mb-6 italic">
              &ldquo;La salopette la indosso ogni mattina per la mungitura. Dopo un anno di fango è ancora impermeabile come il primo giorno.&rdquo;
            </blockquote>
            <p className="text-white/80 text-sm sm:text-base font-semibold tracking-wide">— Cliente MyGesp</p>
          </div>
        </div>
      </section>

      {/* faq */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-ink font-extrabold text-2xl sm:text-4xl tracking-tight">Domande frequenti</h2>
        </div>
        
        <div className="max-w-[760px] mx-auto space-y-4">
          <div className="bg-white border border-line p-6 sm:p-8 hover:border-grass-deep/40 transition-colors shadow-sm">
            <h3 className="text-ink font-bold text-base sm:text-lg mb-2">I prodotti sono davvero testati sul campo?</h3>
            <p className="text-ink-soft text-sm sm:text-base leading-relaxed">Sì, vengono provati direttamente in stalla e al pascolo insieme ad allevatori reali.</p>
          </div>
          <div className="bg-white border border-line p-6 sm:p-8 hover:border-grass-deep/40 transition-colors shadow-sm">
            <h3 className="text-ink font-bold text-base sm:text-lg mb-2">Quanto tempo impiega la spedizione?</h3>
            <p className="text-ink-soft text-sm sm:text-base leading-relaxed">Spediamo in tutta Italia e in Europa con corriere espresso. Sopra i 99€ la spedizione è gratuita.</p>
          </div>
          <div className="bg-white border border-line p-6 sm:p-8 hover:border-grass-deep/40 transition-colors shadow-sm">
            <h3 className="text-ink font-bold text-base sm:text-lg mb-2">Posso restituire un capo se la taglia non va bene?</h3>
            <p className="text-ink-soft text-sm sm:text-base leading-relaxed">Sì, hai 30 giorni di tempo per il reso.</p>
          </div>
        </div>
      </section>
    </main>
  );
}