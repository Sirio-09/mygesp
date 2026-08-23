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

      {/* gamma prodotti */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <p className="text-grass-deep text-xs sm:text-sm font-bold uppercase tracking-widest mb-3">
            Gamma prodotti
          </p>
          <h2 className="text-ink font-extrabold text-2xl sm:text-4xl tracking-tight">
            Vai dritto a quello che ti serve
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/categoria/abbigliamento"
            className="group relative bg-white border border-line p-8 sm:p-10 flex flex-col items-center text-center transition-all duration-300 hover:border-grass-deep hover:shadow-xl hover:-translate-y-1"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-paper-warm flex items-center justify-center mb-6 text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
              🧥
            </div>
            <h3 className="text-ink font-bold text-lg sm:text-xl mb-2 group-hover:text-grass-deep transition-colors">
              Abbigliamento impermeabile
            </h3>
            <p className="text-ink-soft text-sm leading-relaxed">
              Giacche, pantaloni, mantelle
            </p>
          </Link>

          <Link
            href="/categoria/stivali"
            className="group relative bg-white border border-line p-8 sm:p-10 flex flex-col items-center text-center transition-all duration-300 hover:border-grass-deep hover:shadow-xl hover:-translate-y-1"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-paper-warm flex items-center justify-center mb-6 text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
              🥾
            </div>
            <h3 className="text-ink font-bold text-lg sm:text-xl mb-2 group-hover:text-grass-deep transition-colors">
              Stivali e calzature
            </h3>
            <p className="text-ink-soft text-sm leading-relaxed">
              Termici, da lavoro, da campo
            </p>
          </Link>

          <Link
            href="/categoria/attrezzature"
            className="group relative bg-white border border-line p-8 sm:p-10 flex flex-col items-center text-center transition-all duration-300 hover:border-grass-deep hover:shadow-xl hover:-translate-y-1"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-paper-warm flex items-center justify-center mb-6 text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
              🧰
            </div>
            <h3 className="text-ink font-bold text-lg sm:text-xl mb-2 group-hover:text-grass-deep transition-colors">
              Attrezzature e accessori
            </h3>
            <p className="text-ink-soft text-sm leading-relaxed">
              Tutto per il lavoro quotidiano
            </p>
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