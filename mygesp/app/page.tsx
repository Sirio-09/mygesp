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
      {/* HERO SECTION */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="/allevatore_che_indossa_giacca_lunga_impermeabile_uragan_tex.jpg"
          alt="Abbigliamento impermeabile Uragan-Tex"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
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

      {/* GAMMA PRODOTTI */}
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
              <h3 className="text-ink font-medium text-xl mb-3 group-hover:text-grass transition-colors">Abbigliamento Impermeabile</h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed mb-6">Giacche, salopette e mantelle ad alta tenacità. Progettate per isolare completamente dall&apos;acqua.</p>
              <span className="text-xs font-medium uppercase tracking-widest text-ink group-hover:text-grass transition-colors">Scopri i capi &rarr;</span>
            </div>
          </Link>

          <Link href="/categoria/stivali" className="group block">
            <div className="border-t border-line pt-6 transition-colors duration-300 group-hover:border-grass">
              <h3 className="text-ink font-medium text-xl mb-3 group-hover:text-grass transition-colors">Stivali e Calzature</h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed mb-6">Stivali termici e scarponi con isolamento dal freddo e suole profilate per la massima aderenza.</p>
              <span className="text-xs font-medium uppercase tracking-widest text-ink group-hover:text-grass transition-colors">Scopri i modelli &rarr;</span>
            </div>
          </Link>

          <Link href="/categoria/attrezzature" className="group block">
            <div className="border-t border-line pt-6 transition-colors duration-300 group-hover:border-grass">
              <h3 className="text-ink font-medium text-xl mb-3 group-hover:text-grass transition-colors">Attrezzature e Accessori</h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed mb-6">Strumenti robusti e accessori complementari, pensati per resistere all&apos;usura del lavoro quotidiano.</p>
              <span className="text-xs font-medium uppercase tracking-widest text-ink group-hover:text-grass transition-colors">Vedi attrezzature &rarr;</span>
            </div>
          </Link>
        </div>
      </section>

      {/* PRODOTTI IN EVIDENZA */}
      {featuredProducts.length > 0 && (
        <section className="bg-paper-warm/30 py-24 sm:py-32 transform-gpu">
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
                const minPriceCents = product.variants?.length > 0
                    ? Math.min(...product.variants.map((v) => v.priceCents))
                    : 0;

                const isDiscountActive = Boolean(
                  product.discountPercent && product.discountPercent > 0 &&
                  (!product.discountUntil || new Date(product.discountUntil) > new Date())
                );

                const discountedPriceCents = isDiscountActive
                  ? Math.round((minPriceCents * (100 - product.discountPercent!)) / 100)
                  : minPriceCents;

                return (
                  <Link key={product.id} href={`/prodotto/${product.slug}`} className="group flex flex-col">
                    <div className="aspect-[4/5] bg-paper-warm relative w-full overflow-hidden mb-5 rounded-md">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs">No img</div>
                      )}

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
                              <span className="font-medium text-sm text-grass">€{(discountedPriceCents / 100).toFixed(2)}</span>
                              <span className="text-xs text-ink-soft line-through">€{(minPriceCents / 100).toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="font-medium text-sm text-ink-soft">€{(discountedPriceCents / 100).toFixed(2)}</span>
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

      {/* SOCIAL PROOF */}
      <section className="relative py-32 sm:py-40 overflow-hidden flex items-center justify-center transform-gpu">
        <Image
          src="/allevatore_che_indossa_giacca_lunga_impermeabile_uragan_tex.jpg" 
          alt="Lavoro sul campo"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#1A2E1F]/70" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-[0.2em] mb-10">L&apos;esperienza di chi lavora</p>
          <blockquote className="text-2xl sm:text-4xl font-light leading-relaxed mb-10 italic">
            &ldquo;La salopette la indosso ogni mattina per la mungitura. Dopo un anno di fango e lavaggi continui, è ancora impermeabile come il primo giorno.&rdquo;
          </blockquote>
          <p className="text-white text-sm uppercase tracking-widest font-medium">— Cliente MyGesp</p>
        </div>
      </section>

      {/* PERCHÉ SCEGLIERCI E FAQ (RIPRISTINATO E OTTIMIZZATO) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-24 sm:py-32 grid lg:grid-cols-2 gap-16 lg:gap-24">
        
        {/* Colonna Sinistra: Perché Sceglierci */}
        <div>
          <h2 className="text-ink font-light text-3xl sm:text-4xl tracking-tight mb-10">I nostri standard</h2>
          <div className="space-y-8">
            <div className="border-t border-line/40 pt-6">
              <h3 className="text-ink font-medium text-lg mb-2">100% Impermeabili</h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed">Cuciture termonastrate e materiali idrorepellenti ad alta densità per garantirti di restare asciutto anche sotto piogge torrenziali e getti d&apos;acqua ad alta pressione.</p>
            </div>
            <div className="border-t border-line/40 pt-6">
              <h3 className="text-ink font-medium text-lg mb-2">Resistenza Agricola</h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed">Progettati per non strapparsi al primo contatto con recinzioni, macchinari o animali. Usiamo tessuti antistrappo che durano anni, non mesi.</p>
            </div>
            <div className="border-t border-line/40 pt-6">
              <h3 className="text-ink font-medium text-lg mb-2">Comfort e Mobilità</h3>
              <p className="text-ink-soft text-sm font-light leading-relaxed">Materiali che bloccano il vento gelido invernale ma garantiscono una vestibilità comoda, pensata per indossare strati termici sottostanti senza limitare i movimenti lavorativi.</p>
            </div>
          </div>
        </div>

        {/* Colonna Destra: FAQ Zero-JS */}
        <div>
          <h2 className="text-ink font-light text-3xl sm:text-4xl tracking-tight mb-10">Domande frequenti</h2>
          <div className="space-y-4">
            
            <details className="group border-b border-line/40 pb-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-ink font-medium">
                Come scelgo la taglia corretta?
                <span className="shrink-0 transition-transform duration-300 group-open:-rotate-180 text-grass">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-ink-soft text-sm font-light">
                I nostri capi protettivi vestono generalmente comodi per permettere di indossare felpe o maglioni pesanti al di sotto. Ti consigliamo di acquistare la tua taglia abituale.
              </p>
            </details>

            <details className="group border-b border-line/40 pb-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-ink font-medium">
                Come posso lavare i capi in Uragan-Tex?
                <span className="shrink-0 transition-transform duration-300 group-open:-rotate-180 text-grass">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-ink-soft text-sm font-light">
                Per mantenere inalterata l&apos;impermeabilità, consigliamo un lavaggio a mano con semplice spugna e acqua. Se necessario, è possibile il lavaggio in lavatrice a massimo 30°C senza centrifuga. Non utilizzare mai ammorbidenti o asciugatrice.
              </p>
            </details>

            <details className="group border-b border-line/40 pb-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-ink font-medium">
                Effettuate spedizioni in tutta Italia?
                <span className="shrink-0 transition-transform duration-300 group-open:-rotate-180 text-grass">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-ink-soft text-sm font-light">
                Assolutamente sì. Affidiamo le nostre spedizioni ai migliori corrieri nazionali per garantire consegne rapide in 24/48 ore lavorative in tutta la penisola e isole maggiori.
              </p>
            </details>

          </div>
        </div>
      </section>
    </main>
  );
}