import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const featured = await prisma.product.findMany({
    take: 4,
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      {/* hero */}
      <header className="relative bg-loden-deep overflow-hidden">
        <div className="grid md:grid-cols-[1.1fr_1fr] min-h-[520px]">
          <div className="p-12 flex flex-col justify-center relative z-10">
            <div className="text-signal text-[13px] tracking-[0.12em] mb-4 font-display uppercase">
              Uragan-tex · bisont
            </div>
            <h1 className="font-display text-4xl md:text-5xl leading-[1.08] text-white uppercase tracking-wide mb-5">
              Testati in stalla,<br />non in <span className="text-rust">laboratorio</span>
            </h1>
            <p className="text-canvas-deep text-base max-w-[440px] mb-8">
              Abbigliamento impermeabile e stivali termici per chi lavora ogni giorno tra pioggia, fango e freddo. Scelti da allevatori, non da un catalogo.
            </p>
            <a href="#" className="inline-flex items-center gap-2 bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide text-[15px] font-semibold py-4 px-7 w-fit">
              Scopri l&apos;abbigliamento tecnico →
            </a>
          </div>
          <div className="relative bg-gradient-to-br from-[#3E4A34] to-[#20281C] flex items-center justify-center text-canvas-deep text-[13px] text-center p-8">
            [foto: allevatore con giacca Uragan-Tex sotto la pioggia, in alpeggio]
            <div className="absolute bottom-9 -left-8 bg-white border border-dashed border-mud py-3.5 px-4.5 -rotate-3 z-10 min-w-[200px]">
              <div className="text-[10px] tracking-wide text-slate uppercase mb-1.5">Colonna d&apos;acqua</div>
              <div className="font-mono text-xl font-medium text-rust-deep">5.000mm</div>
              <div className="text-[11px] text-mud mt-1">Traspirante · doppio strato</div>
            </div>
          </div>
        </div>
      </header>

      {/* trust bar */}
      <div className="bg-white border-b border-dashed border-mud">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 py-5 px-8">
          <div className="flex items-center gap-3 text-[13px] text-slate font-medium">
            <span className="w-2 h-2 bg-rust flex-shrink-0"></span>Testati in stalla e al pascolo
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate font-medium">
            <span className="w-2 h-2 bg-rust flex-shrink-0"></span>Assistenza da chi conosce il settore
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate font-medium">
            <span className="w-2 h-2 bg-rust flex-shrink-0"></span>Spedizione gratuita sopra 99€
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate font-medium">
            <span className="w-2 h-2 bg-rust flex-shrink-0"></span>Reso entro 30 giorni
          </div>
        </div>
      </div>

      {/* prodotti reali dal database */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="mb-9 max-w-[600px]">
            <div className="text-rust text-xs tracking-[0.1em] uppercase mb-2.5 font-semibold">I più scelti</div>
            <h2 className="font-display text-3xl uppercase text-loden-deep tracking-wide">Uragan-Tex &amp; Bisont</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/prodotto/${product.slug}`}
                className="bg-white border border-canvas-deep relative block hover:border-rust transition-colors"
              >
                <div className="aspect-square bg-[#DCD4BF] flex items-center justify-center text-[11px] text-mud text-center p-4 relative overflow-hidden">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>[nessuna foto]</span>
                  )}
                  {product.waterColumn && (
                    <span className="absolute top-2.5 right-2.5 bg-loden text-canvas font-mono text-[10px] py-1 px-2 z-10">
                      {product.waterColumn}MM
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-loden-deep mb-2 leading-tight">{product.name}</h3>
                  <div className="flex items-baseline gap-2">
                    {product.variants[0] && (
                      <span className="font-mono font-medium text-base text-rust-deep">
                        €{(product.variants[0].priceCents / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* categorie */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="mb-9 max-w-[600px]">
            <div className="text-rust text-xs tracking-[0.1em] uppercase mb-2.5 font-semibold">Cosa cerchi</div>
            <h2 className="font-display text-3xl uppercase text-loden-deep tracking-wide">Vai dritto al prodotto</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <a href="#" className="relative aspect-[4/3] bg-loden-deep flex items-end p-6 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"></div>
              <div className="absolute top-4 left-4 right-4 text-[11px] text-canvas-deep opacity-55 font-mono">
                [foto: giacca appesa in scuderia]
              </div>
              <span className="relative z-10 text-white font-display text-lg uppercase tracking-wide">
                Abbigliamento impermeabile
              </span>
            </a>
            <a href="#" className="relative aspect-[4/3] bg-loden-deep flex items-end p-6 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"></div>
              <div className="absolute top-4 left-4 right-4 text-[11px] text-canvas-deep opacity-55 font-mono">
                [foto: stivali sporchi di fango]
              </div>
              <span className="relative z-10 text-white font-display text-lg uppercase tracking-wide">
                Stivali e calzature
              </span>
            </a>
            <a href="#" className="relative aspect-[4/3] bg-loden-deep flex items-end p-6 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"></div>
              <div className="absolute top-4 left-4 right-4 text-[11px] text-canvas-deep opacity-55 font-mono">
                [foto: pettorina al lavoro]
              </div>
              <span className="relative z-10 text-white font-display text-lg uppercase tracking-wide">
                Attrezzature e accessori
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* social proof */}
      <section className="py-16 bg-loden text-canvas">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="mb-9 max-w-[600px]">
            <div className="text-signal text-xs tracking-[0.1em] uppercase mb-2.5 font-semibold">Testato sul campo</div>
            <h2 className="font-display text-3xl uppercase text-white tracking-wide">Non ce lo inventiamo noi</h2>
          </div>
          <div className="grid md:grid-cols-[1fr_1.3fr] gap-10 items-center">
            <div className="aspect-[4/3] bg-[#3A4530] flex items-center justify-center text-canvas-deep text-xs text-center p-6">
              [foto/video: cliente al lavoro con capo Uragan-Tex]
            </div>
            <div>
              <p className="text-xl leading-relaxed text-white mb-4">
                &ldquo;La salopette la indosso ogni mattina per la mungitura. Dopo un anno di fango e disinfettante è ancora impermeabile come il primo giorno.&rdquo;
              </p>
              <p className="font-mono text-[13px] text-signal">— PAMELA MAGGIONI, ALLEVATRICE</p>
            </div>
          </div>
        </div>
      </section>

      {/* faq */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="mb-9 max-w-[600px]">
            <div className="text-rust text-xs tracking-[0.1em] uppercase mb-2.5 font-semibold">Prima di scrivere</div>
            <h2 className="font-display text-3xl uppercase text-loden-deep tracking-wide">Domande frequenti</h2>
          </div>
          <div className="border-b border-dashed border-mud py-5">
            <h4 className="text-[15px] text-loden-deep mb-2 font-semibold">I prodotti sono davvero testati sul campo?</h4>
            <p className="text-sm text-slate">Sì, vengono provati direttamente in stalla e al pascolo insieme ad allevatori reali, prima di finire in catalogo.</p>
          </div>
          <div className="border-b border-dashed border-mud py-5">
            <h4 className="text-[15px] text-loden-deep mb-2 font-semibold">Quanto tempo impiega la spedizione?</h4>
            <p className="text-sm text-slate">Spediamo in tutta Italia con corriere espresso. Sopra i 99€ la spedizione è gratuita.</p>
          </div>
          <div className="border-b border-dashed border-mud py-5">
            <h4 className="text-[15px] text-loden-deep mb-2 font-semibold">Posso restituire un capo se la taglia non va bene?</h4>
            <p className="text-sm text-slate">Sì, hai 30 giorni di tempo per il reso, anche se il capo è stato indossato per prova sul lavoro.</p>
          </div>
        </div>
      </section>

      {/* footer minimo */}
      <footer className="bg-loden-deep text-canvas-deep py-12">
        <div className="max-w-[1200px] mx-auto px-8 text-center text-xs text-mud">
          © 2026 MyGesp di Panero Enrica — P.IVA 04093030049
          <span className="mx-2">·</span>
          <Link href="/admin/login" className="hover:text-canvas-deep underline">
            Area tecnica
          </Link>
        </div>
      </footer>
    </main>
  );
}