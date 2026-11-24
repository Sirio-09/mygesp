import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/motion/Reveal";

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true },
    take: 8,
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* HERO SECTION */}
      <section className="relative flex h-[80svh] min-h-[560px] items-center justify-center overflow-hidden">
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

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
          <p className="mb-6 animate-fade-up text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80 sm:text-xs">
            Uragan-Tex · Bisont
          </p>

          <h1 className="mb-8 animate-fade-up text-4xl font-light leading-[1.05] tracking-tight text-white [animation-delay:80ms] sm:text-6xl lg:text-7xl">
            Testati in stalla, <br />
            <span className="italic text-white/90">non in laboratorio.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl animate-fade-up text-base font-light leading-relaxed text-white/70 [animation-delay:160ms] sm:text-lg">
            Abbigliamento impermeabile e stivali termici progettati per la routine quotidiana tra pioggia, fango e freddo. Scelti dai veri professionisti del settore agricolo.
          </p>

          <Link
            href="/categoria/abbigliamento"
            className="group inline-flex animate-fade-up items-center justify-center gap-3 bg-white px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 ease-out-expo [animation-delay:240ms] hover:bg-grass hover:text-white"
          >
            Esplora la collezione
            <svg
              className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* GAMMA PRODOTTI */}
      <section className="mx-auto max-w-[1280px] px-4 py-24 sm:px-6 sm:py-32 lg:px-10">
        <div className="mb-16 flex flex-col justify-between gap-6 border-b border-line/50 pb-6 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-ink sm:text-4xl">
              Le nostre categorie
            </h2>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            Equipaggiamento tecnico
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <Link href="/categoria/abbigliamento" className="group block">
            <div className="border-t border-line pt-6 transition-colors duration-300 ease-out-expo group-hover:border-grass">
              <span className="mb-4 block text-[10px] font-medium tabular-nums tracking-[0.2em] text-ink-soft">01</span>
              <h3 className="mb-3 text-xl font-medium text-ink transition-colors duration-300 group-hover:text-grass-deep">Abbigliamento Impermeabile</h3>
              <p className="mb-6 text-sm font-light leading-relaxed text-ink-soft">Giacche, salopette e mantelle ad alta tenacità. Progettate per isolare completamente dall&apos;acqua.</p>
              <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 group-hover:text-grass-deep">
                Scopri i capi
                <svg className="h-3 w-3 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </Link>

          <Link href="/categoria/stivali" className="group block">
            <div className="border-t border-line pt-6 transition-colors duration-300 ease-out-expo group-hover:border-grass">
              <span className="mb-4 block text-[10px] font-medium tabular-nums tracking-[0.2em] text-ink-soft">02</span>
              <h3 className="mb-3 text-xl font-medium text-ink transition-colors duration-300 group-hover:text-grass-deep">Stivali e Calzature</h3>
              <p className="mb-6 text-sm font-light leading-relaxed text-ink-soft">Stivali termici e scarponi con isolamento dal freddo e suole profilate per la massima aderenza.</p>
              <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 group-hover:text-grass-deep">
                Scopri i modelli
                <svg className="h-3 w-3 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </Link>

          <Link href="/categoria/attrezzature" className="group block">
            <div className="border-t border-line pt-6 transition-colors duration-300 ease-out-expo group-hover:border-grass">
              <span className="mb-4 block text-[10px] font-medium tabular-nums tracking-[0.2em] text-ink-soft">03</span>
              <h3 className="mb-3 text-xl font-medium text-ink transition-colors duration-300 group-hover:text-grass-deep">Attrezzature e Accessori</h3>
              <p className="mb-6 text-sm font-light leading-relaxed text-ink-soft">Strumenti robusti e accessori complementari, pensati per resistere all&apos;usura del lavoro quotidiano.</p>
              <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 group-hover:text-grass-deep">
                Vedi attrezzature
                <svg className="h-3 w-3 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
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

            <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
              {featuredProducts.map((product, index) => {
                const minPriceCents = product.variants?.length > 0
                    ? Math.min(...product.variants.map((v) => v.priceCents))
                    : 0;

                const isDiscountActive = Boolean(
                  product.discountPercent && product.discountPercent > 0 &&
                  (!product.discountUntil || new Date(product.discountUntil) > new Date())
                );

                return (
                  <Reveal
                    key={product.id}
                    delay={Math.min(index, 3) * 70}
                    className="h-full"
                  >
                    <ProductCard
                      name={product.name}
                      slug={product.slug}
                      image={product.images[0]}
                      priceCents={minPriceCents}
                      discountPercent={product.discountPercent}
                      isDiscountActive={isDiscountActive}
                      waterColumn={product.waterColumn}
                      priority={index < 2}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
                    />
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SOCIAL PROOF */}
      <section className="relative flex items-center justify-center overflow-hidden py-32 sm:py-40">
        <Image
          src="/allevatore_che_indossa_giacca_lunga_impermeabile_uragan_tex.jpg"
          alt="Lavoro sul campo"
          fill
          sizes="100vw"
          className="scale-105 object-cover object-[center_72%]"
        />
        <div className="absolute inset-0 bg-ink/80" />

        <Reveal
          variant="fade"
          className="relative z-10 mx-auto max-w-3xl px-4 text-center text-white"
        >
          <p className="mb-10 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">L&apos;esperienza di chi lavora</p>
          <blockquote className="mb-10 text-2xl font-light italic leading-relaxed sm:text-4xl">
            &ldquo;La salopette la indosso ogni mattina per la mungitura. Dopo un anno di fango e lavaggi continui, è ancora impermeabile come il primo giorno.&rdquo;
          </blockquote>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white">— Cliente MyGesp</p>
        </Reveal>
      </section>

      {/* PERCHÉ SCEGLIERCI E FAQ */}
      <section className="mx-auto grid max-w-[1280px] gap-16 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-2 lg:gap-24 lg:px-10">

        {/* Colonna Sinistra: Perché Sceglierci */}
        <div>
          <h2 className="mb-10 text-3xl font-light tracking-tight text-ink sm:text-4xl">I nostri standard</h2>
          <div className="space-y-8">
            <div className="border-t border-line/50 pt-6">
              <h3 className="mb-2 text-lg font-medium text-ink">100% Impermeabili</h3>
              <p className="text-sm font-light leading-relaxed text-ink-soft">Cuciture termonastrate e materiali idrorepellenti ad alta densità per garantirti di restare asciutto anche sotto piogge torrenziali e getti d&apos;acqua ad alta pressione.</p>
            </div>
            <div className="border-t border-line/50 pt-6">
              <h3 className="mb-2 text-lg font-medium text-ink">Resistenza Agricola</h3>
              <p className="text-sm font-light leading-relaxed text-ink-soft">Progettati per non strapparsi al primo contatto con recinzioni, macchinari o animali. Usiamo tessuti antistrappo che durano anni, non mesi.</p>
            </div>
            <div className="border-t border-line/50 pt-6">
              <h3 className="mb-2 text-lg font-medium text-ink">Comfort e Mobilità</h3>
              <p className="text-sm font-light leading-relaxed text-ink-soft">Materiali che bloccano il vento gelido invernale ma garantiscono una vestibilità comoda, pensata per indossare strati termici sottostanti senza limitare i movimenti lavorativi.</p>
            </div>
          </div>
        </div>

        {/* Colonna Destra: FAQ Zero-JS */}
        <div>
          <h2 className="mb-10 text-3xl font-light tracking-tight text-ink sm:text-4xl">Domande frequenti</h2>
          <div>
            {[
              {
                question: "Come scelgo la taglia corretta?",
                answer:
                  "I nostri capi protettivi vestono generalmente comodi per permettere di indossare felpe o maglioni pesanti al di sotto. Ti consigliamo di acquistare la tua taglia abituale.",
              },
              {
                question: "Come posso lavare i capi in Uragan-Tex?",
                answer:
                  "Per mantenere inalterata l'impermeabilità, consigliamo un lavaggio a mano con semplice spugna e acqua. Se necessario, è possibile il lavaggio in lavatrice a massimo 30°C senza centrifuga. Non utilizzare mai ammorbidenti o asciugatrice.",
              },
              {
                question: "Effettuate spedizioni in tutta Italia?",
                answer:
                  "Assolutamente sì. Affidiamo le nostre spedizioni ai migliori corrieri nazionali per garantire consegne rapide in 24/48 ore lavorative in tutta la penisola e isole maggiori.",
              },
            ].map((faq) => (
              <details key={faq.question} className="group border-b border-line/50 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-ink transition-colors duration-300 hover:text-grass-deep">
                  <span className="text-[13px] font-medium leading-snug">{faq.question}</span>
                  <span className="shrink-0 text-grass-deep transition-transform duration-300 ease-out-expo group-open:-rotate-180">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out-expo group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="pb-5 pr-8 text-sm font-light leading-relaxed text-ink-soft">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}