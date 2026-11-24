// Footer.tsx
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

const productLinks = [
  { label: "Abbigliamento", href: "/categoria/abbigliamento" },
  { label: "Stivali", href: "/categoria/stivali" },
  { label: "Attrezzature", href: "/categoria/attrezzature" },
];

const serviceLinks = [
  { label: "Il tuo carrello", href: "/carrello" },
  { label: "I tuoi ordini", href: "/account/ordini" },
  { label: "Password dimenticata", href: "/account/password-dimenticata" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line/10 bg-ink text-white">
      <Reveal
        variant="fade"
        className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24 lg:px-10"
      >
        <div className="mb-16 grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-12">

          {/* Brand & Dati Generali */}
          <div className="flex flex-col justify-between md:col-span-6 lg:col-span-5">
            <div>
              <Link
                href="/"
                className="mb-6 inline-flex items-center text-2xl uppercase tracking-[0.1em] transition-opacity duration-300 hover:opacity-70"
              >
                <span className="font-light">MY</span>
                <span className="font-medium">GESP</span>
              </Link>
              <p className="max-w-[360px] text-sm font-light leading-relaxed text-white/70">
                Abbigliamento impermeabile, stivali termici e attrezzature professionali per agricoltura e allevamento. Testati in stalla, al pascolo e nel fango.
              </p>
            </div>

            <div className="mt-8 text-[11px] font-light uppercase tracking-[0.14em] text-white/60">
              <p className="mb-1 font-medium text-white/80">MyGesp di Panero Enrica</p>
              <p>P.IVA 04093030049</p>
            </div>
          </div>

          {/* Prodotti */}
          <div className="md:col-span-3 lg:col-span-3">
            <h3 className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Prodotti
            </h3>
            <ul className="space-y-4">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-underline inline-block text-sm font-light text-white/75 transition-colors duration-300 ease-out-expo hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Assistenza & Account */}
          <div className="md:col-span-3 lg:col-span-4">
            <h3 className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Assistenza &amp; Account
            </h3>
            <ul className="space-y-4">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-underline inline-block text-sm font-light text-white/75 transition-colors duration-300 ease-out-expo hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Fascia di chiusura: Copyright & Link Legali */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 text-[10px] font-medium uppercase tracking-[0.14em] text-white/60 md:flex-row">
          <p>© {new Date().getFullYear()} MyGesp. Tutti i diritti riservati.</p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <Link href="/termini" className="link-underline transition-colors duration-300 hover:text-white">
              Termini e Condizioni
            </Link>
            <Link href="/privacy" className="link-underline transition-colors duration-300 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/admin/login" className="transition-colors duration-300 hover:text-white">
              Area tecnica
            </Link>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
