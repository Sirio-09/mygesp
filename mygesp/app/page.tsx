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
    <main>
      {/* hero */}
      <section className="relative bg-ink overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24 lg:py-32 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-grass text-xs sm:text-sm font-bold uppercase tracking-wide mb-4">
              Uragan-Tex · Bisont
            </p>
            <h1 className="text-white font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
              Testati in stalla,<br />non in laboratorio
            </h1>
            <p className="text-paper-warm/80 text-base sm:text-lg max-w-[480px] mb-8">
              Abbigliamento impermeabile e stivali termici per chi lavora ogni giorno tra pioggia, fango e freddo. Scelti da allevatori, non da un catalogo.
            </p>
            <Link
              href="/categoria/abbigliamento"
              className="inline-block bg-grass hover:bg-grass-deep text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 transition-colors"
            >
              Scopri l&apos;abbigliamento tecnico →
            </Link>
          </div>
          <div className="relative aspect-[4/3] bg-ink-soft/30 flex items-center justify-center text-paper-warm/50 text-xs sm:text-sm text-center p-6">
            [foto: allevatore con giacca Uragan-Tex sotto la pioggia, in alpeggio]
          </div>
        </div>
      </section>

      {/* gamma prodotti */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-grass-deep text-xs sm:text-sm font-bold uppercase tracking-wide mb-2">
            Gamma prodotti
          </p>
          <h2 className="text-ink font-extrabold text-2xl sm:text-3xl lg:text-4xl">
            Vai dritto a quello che ti serve
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Link
            href="/categoria/abbigliamento"
            className="group border border-line hover:border-grass-deep transition-colors p-6 sm:p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-paper-warm flex items-center justify-center mb-4 text-2xl sm:text-3xl">
              🧥
            </div>
            <h3 className="text-ink font-bold text-base sm:text-lg mb-1">Abbigliamento impermeabile</h3>
            <p className="text-ink-soft text-sm">Giacche, pantaloni, mantelle</p>
          </Link>
          <Link
            href="/categoria/stivali"
            className="group border border-line hover:border-grass-deep transition-colors p-6 sm:p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-paper-warm flex items-center justify-center mb-4 text-2xl sm:text-3xl">
              🥾
            </div>
            <h3 className="text-ink font-bold text-base sm:text-lg mb-1">Stivali e calzature</h3>
            <p className="text-ink-soft text-sm">Termici, da lavoro, da campo</p>
          </Link>
          <Link
            href="/categoria/attrezzature"
            className="group border border-line hover:border-grass-deep transition-colors p-6 sm:p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-paper-warm flex items-center justify-center mb-4 text-2xl sm:text-3xl">
              🧰
            </div>
            <h3 className="text-ink font-bold text-base sm:text-lg mb-1">Attrezzature e accessori</h3>
            <p className="text-ink-soft text-sm">Tutto per il lavoro quotidiano</p>
          </Link>
        </div>
      </section>

      {/* prodotti in evidenza */}
      {featuredProducts.length > 0 && (
        <section className="bg-paper-warm py-14 sm:py-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
              <div>
                <p className="text-grass-deep text-xs sm:text-sm font-bold uppercase tracking-wide mb-2">
                  I più scelti
                </p>
                <h2 className="text-ink font-extrabold text-2xl sm:text-3xl">
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

                const isDiscountActive =
                  product.discountPercent &&
                  product.discountPercent > 0 &&
                  (!product.discountUntil || new Date(product.discountUntil) > new Date());

                const discountedPriceCents = isDiscountActive
                  ? Math.round((minPriceCents * (100 - product.discountPercent!)) / 100)
                  : minPriceCents;

                const formattedPrice = (discountedPriceCents / 100).toFixed(2);
                const formattedFullPrice = (minPriceCents / 100).toFixed(2);

                return (
                  <Link
                    key={product.id}
                    href={`/prodotto/${product.slug}`}
                    className="bg-white border border-line hover:border-grass-deep hover:shadow-md transition-all relative group"
                  >
                    <div className="aspect-square bg-line/40 relative overflow-hidden">
                      {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs text-center p-3">
                          [nessuna foto]
                        </div>
                      )}

                      {/* Badge Sconto */}
                      {isDiscountActive && (
                        <span className="absolute top-2 left-2 bg-soil-deep text-white text-[10px] font-bold px-2 py-1">
                          -{product.discountPercent}%
                        </span>
                      )}

                      {product.waterColumn && (
                        <span className="absolute top-2 right-2 bg-grass-deep text-white text-[10px] font-bold px-2 py-1">
                          {product.waterColumn}MM
                        </span>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-ink text-sm font-semibold mb-1.5 leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                      {product.variants.length > 0 && (
                        <div className="flex items-baseline gap-2">
                          {isDiscountActive ? (
                            <>
                              <span className="text-soil-deep font-bold text-sm sm:text-base">
                                €{formattedPrice}
                              </span>
                              <span className="text-ink-soft text-xs line-through">
                                €{formattedFullPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-soil-deep font-bold text-sm sm:text-base">
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
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-grass-deep text-xs sm:text-sm font-bold uppercase tracking-wide mb-2">
            Perché MyGesp
          </p>
          <h2 className="text-ink font-extrabold text-2xl sm:text-3xl lg:text-4xl">
            Non è marketing, è il lavoro vero
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="border-t-4 border-grass pt-4">
            <h3 className="text-ink font-bold text-base sm:text-lg mb-1.5">Testati sul campo</h3>
            <p className="text-ink-soft text-sm">In stalla e al pascolo, non solo in laboratorio.</p>
          </div>
          <div className="border-t-4 border-grass pt-4">
            <h3 className="text-ink font-bold text-base sm:text-lg mb-1.5">Materiali robusti</h3>
            <p className="text-ink-soft text-sm">Ad alta tenacità, pensati per durare anni.</p>
          </div>
          <div className="border-t-4 border-grass pt-4">
            <h3 className="text-ink font-bold text-base sm:text-lg mb-1.5">Assistenza reale</h3>
            <p className="text-ink-soft text-sm">Da chi lavora ogni giorno nel settore agricolo.</p>
          </div>
          <div className="border-t-4 border-grass pt-4">
            <h3 className="text-ink font-bold text-base sm:text-lg mb-1.5">Spedizioni rapide</h3>
            <p className="text-ink-soft text-sm">In tutta Italia e in Europa, imballaggi sicuri.</p>
          </div>
        </div>
      </section>

      {/* social proof */}
      <section className="bg-grass-deep py-14 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-8 sm:gap-10 items-center">
          <div className="aspect-[4/3] bg-white/10 flex items-center justify-center text-white/60 text-xs sm:text-sm text-center p-6">
            [foto/video: cliente al lavoro con capo Uragan-Tex]
          </div>
          <div>
            <p className="text-grass text-xs sm:text-sm font-bold uppercase tracking-wide mb-2">
              Testato sul campo
            </p>
            <p className="text-white text-lg sm:text-2xl leading-relaxed mb-4">
              &ldquo;La salopette la indosso ogni mattina per la mungitura. Dopo un anno di fango è ancora impermeabile come il primo giorno.&rdquo;
            </p>
            <p className="text-white/70 text-sm font-medium">— Cliente MyGesp</p>
          </div>
        </div>
      </section>

      {/* faq */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-ink font-extrabold text-2xl sm:text-3xl">Domande frequenti</h2>
        </div>
        <div className="max-w-[720px] mx-auto divide-y divide-line">
          <div className="py-5">
            <h3 className="text-ink font-semibold text-sm sm:text-base mb-1.5">I prodotti sono davvero testati sul campo?</h3>
            <p className="text-ink-soft text-sm">Sì, vengono provati direttamente in stalla e al pascolo insieme ad allevatori reali.</p>
          </div>
          <div className="py-5">
            <h3 className="text-ink font-semibold text-sm sm:text-base mb-1.5">Quanto tempo impiega la spedizione?</h3>
            <p className="text-ink-soft text-sm">Spediamo in tutta Italia e in Europa con corriere espresso. Sopra i 99€ la spedizione è gratuita.</p>
          </div>
          <div className="py-5">
            <h3 className="text-ink font-semibold text-sm sm:text-base mb-1.5">Posso restituire un capo se la taglia non va bene?</h3>
            <p className="text-ink-soft text-sm">Sì, hai 30 giorni di tempo per il reso.</p>
          </div>
        </div>
      </section>
    </main>
  );
}