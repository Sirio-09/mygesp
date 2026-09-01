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
    <main className="bg-paper min-h-screen text-ink selection:bg-grass selection:text-white">
      {/* HERO SECTION - Elegante e a tutto schermo */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="/allevatore_che_indossa_giacca_lunga_impermeabile_uragan_tex.jpg"
          alt="Abbigliamento impermeabile Uragan-Tex"
          fill
          priority
          className="object-cover object-[center_30%]"
        />
        {/* Overlay scuro per far risaltare il testo */}
        <div className="absolute inset-0 bg-ink/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center mt-12">
          <p className="text-white/80 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-6">
            Uragan-Tex · Bisont
          </p>
          
          <h1 className="text-white font-medium text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-8">
            Testati in stalla, <br />
            <span className="font-light italic text-white/90">non in laboratorio.</span>
          </h1>
          
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Abbigliamento impermeabile e stivali termici progettati per la routine quotidiana tra pioggia, fango e freddo. Scelti dai veri professionisti del settore agricolo.
          </p>
          
          <Link
            href="/categoria/abbigliamento"
            className="inline-flex items-center justify-center bg-white text-ink hover:bg-grass hover:text-white font-medium text-sm px-8 py-4 transition-colors duration-300 uppercase tracking-widest"
          >
            Esplora la collezione
          </Link>
        </div>
      </section>

      {/* GAMMA PRODOTTI - Stile minimalista ed editoriale */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-24 sm:py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-line/40 pb-6">
          <div>
            <h2 className="text-ink font-light text-3xl sm:text-4xl tracking-tight">
              Le nostre categorie
            </h2>
          </div>
          <p className="text-ink-soft text-sm uppercase tracking-widest">
            Equipaggiamento tecnico
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/categoria/abbigliamento" className="group block">
            <div className="border-t border-line pt-6 transition-colors duration-300 group-hover:border-grass">
              <h3 className="text-ink font-medium text-xl mb-3 group-hover:text-grass transition-colors">
                Abbigliamento Impermeabile
              </h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed mb-6">
                Giacche, salopette e mantelle ad alta tenacità. Progettate per isolare completamente dall&apos;acqua.
              </p>
              <span className="text-xs font-medium uppercase tracking-widest text-ink group-hover:text-grass transition-colors">
                Scopri i capi &rarr;
              </span>
            </div>
          </Link>

          <Link href="/categoria/stivali" className="group block">
            <div className="border-t border-line pt-6 transition-colors duration-300 group-hover:border-grass">
              <h3 className="text-ink font-medium text-xl mb-3 group-hover:text-grass transition-colors">
                Stivali e Calzature
              </h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed mb-6">
                Stivali termici e scarponi con isolamento dal freddo e suole profilate per la massima aderenza.
              </p>
              <span className="text-xs font-medium uppercase tracking-widest text-ink group-hover:text-grass transition-colors">
                Scopri i modelli &rarr;
              </span>
            </div>
          </Link>

          <Link href="/categoria/attrezzature" className="group block">
            <div className="border-t border-line pt-6 transition-colors duration-300 group-hover:border-grass">
              <h3 className="text-ink font-medium text-xl mb-3 group-hover:text-grass transition-colors">
                Attrezzature e Accessori
              </h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed mb-6">
                Strumenti robusti e accessori complementari, pensati per resistere all&apos;usura del lavoro quotidiano.
              </p>
              <span className="text-xs font-medium uppercase tracking-widest text-ink group-hover:text-grass transition-colors">
                Vedi attrezzature &rarr;
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* PRODOTTI IN EVIDENZA - Griglia pulita e raffinata */}
      {featuredProducts.length > 0 && (
        <section className="bg-paper-warm/30 py-24 sm:py-32">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-16">
              <p className="text-ink-soft text-xs font-semibold uppercase tracking-[0.15em] mb-3">
                Selezione
              </p>
              <h2 className="text-ink font-light text-3xl sm:text-4xl tracking-tight">
                I capi più scelti
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
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
                    className="group flex flex-col"
                  >
                    <div className="aspect-[4/5] bg-paper relative w-full overflow-hidden mb-5">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs uppercase tracking-widest font-light bg-line/10">
                          Nessuna immagine
                        </div>
                      )}

                      {/* Badge Sconto Elegante */}
                      {isDiscountActive && (
                        <span className="absolute top-4 left-4 bg-grass text-white text-xs font-medium px-3 py-1.5 uppercase tracking-widest">
                          -{product.discountPercent}%
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col flex-grow">
                      <h3 className="text-sm font-medium text-ink mb-2 leading-snug group-hover:text-grass transition-colors">
                        {product.name}
                      </h3>
                      
                      {product.variants.length > 0 && (
                        <div className="mt-auto pt-2 flex items-baseline gap-3">
                          {isDiscountActive ? (
                            <>
                              <span className="font-medium text-sm text-grass">
                                €{formattedPrice}
                              </span>
                              <span className="text-xs text-ink-soft line-through">
                                €{formattedFullPrice}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium text-sm text-ink-soft">
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

      {/* SOCIAL PROOF - Immagine a tutto schermo con overlay verde elegante */}
      <section className="relative py-32 sm:py-40 overflow-hidden flex items-center justify-center">
        {/* L'immagine di sfondo occupa l'intera sezione */}
        <Image
          src="/allevatore_che_indossa_giacca_lunga_impermeabile_uragan_tex.jpg" /* Sostituire con immagine appropriata del cliente/lavoro */
          alt="Lavoro sul campo"
          fill
          className="object-cover object-center"
        />
        {/* Overlay verde profondo per garantire leggibilità ed eleganza */}
        <div className="absolute inset-0 bg-grass-deep/85 mix-blend-multiply" />
        <div className="absolute inset-0 bg-ink/40" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-[0.2em] mb-10">
            L'esperienza di chi lavora
          </p>
          <blockquote className="text-2xl sm:text-4xl font-light leading-relaxed mb-10 italic">
            &ldquo;La salopette la indosso ogni mattina per la mungitura. Dopo un anno di fango e lavaggi continui, è ancora impermeabile come il primo giorno.&rdquo;
          </blockquote>
          <p className="text-white/90 text-sm uppercase tracking-widest font-medium">
            — Cliente MyGesp
          </p>
        </div>
      </section>

      {/* PERCHÉ SCEGLIERCI E FAQ - Layout combinato e pulito */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-24 sm:py-32 grid lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Valori */}
        <div>
          <h2 className="text-ink font-light text-3xl mb-12">I nostri standard</h2>
          <div className="space-y-10">
            <div className="border-t border-line/40 pt-6">
              <h3 className="text-ink font-medium text-base mb-2 uppercase tracking-wide">Testati sul campo</h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed">Provati in stalla e al pascolo, affrontando le condizioni reali del lavoro agricolo quotidiano.</p>
            </div>
            <div className="border-t border-line/40 pt-6">
              <h3 className="text-ink font-medium text-base mb-2 uppercase tracking-wide">Materiali robusti</h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed">Tessuti ad alta tenacità e cuciture termonastrate, progettati per non cedere agli strappi e durare negli anni.</p>
            </div>
            <div className="border-t border-line/40 pt-6">
              <h3 className="text-ink font-medium text-base mb-2 uppercase tracking-wide">Assistenza reale</h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed">Supporto diretto fornito da chi conosce le esigenze del settore agricolo e zootecnico.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-ink font-light text-3xl mb-12">Domande frequenti</h2>
          <div className="space-y-10">
            <div className="border-t border-line/40 pt-6">
              <h3 className="text-ink font-medium text-base mb-2">I prodotti sono testati realmente?</h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed">Sì, la progettazione si basa sui feedback di allevatori e agricoltori che utilizzano i capi quotidianamente nei loro ambienti di lavoro.</p>
            </div>
            <div className="border-t border-line/40 pt-6">
              <h3 className="text-ink font-medium text-base mb-2">Quali sono le tempistiche di spedizione?</h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed">Le consegne avvengono tramite corriere espresso in tutta Europa. Per ordini superiori a 99€, la spedizione è inclusa nel prezzo.</p>
            </div>
            <div className="border-t border-line/40 pt-6">
              <h3 className="text-ink font-medium text-base mb-2">È possibile effettuare un reso?</h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed">Certamente, garantiamo 30 giorni di tempo dalla ricezione dell&apos;ordine per richiedere un cambio taglia o la restituzione del capo.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}