import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper-warm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-white text-xl font-extrabold mb-3">
              MY<span className="text-grass">GESP</span>
            </h2>
            <p className="text-sm text-paper-warm/70 max-w-[280px]">
              Abbigliamento impermeabile, stivali e attrezzature professionali per agricoltura e allevamento. Testati in stalla, al pascolo, nel fango.
            </p>
          </div>

          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wide mb-4">Prodotti</h3>
            <ul className="space-y-2">
              <li><Link href="/categoria/abbigliamento" className="text-sm text-paper-warm/70 hover:text-white transition-colors">Abbigliamento</Link></li>
              <li><Link href="/categoria/stivali" className="text-sm text-paper-warm/70 hover:text-white transition-colors">Stivali</Link></li>
              <li><Link href="/categoria/attrezzature" className="text-sm text-paper-warm/70 hover:text-white transition-colors">Attrezzature</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wide mb-4">Assistenza</h3>
            <ul className="space-y-2">
              <li><Link href="/carrello" className="text-sm text-paper-warm/70 hover:text-white transition-colors">Il tuo carrello</Link></li>
              <li><Link href="/account/ordini" className="text-sm text-paper-warm/70 hover:text-white transition-colors">I tuoi ordini</Link></li>
              <li><Link href="/account/password-dimenticata" className="text-sm text-paper-warm/70 hover:text-white transition-colors">Password dimenticata</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wide mb-4">Resta aggiornato</h3>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-paper-warm/50">
          <p>© 2026 MyGesp di Panero Enrica — P.IVA 04093030049</p>
          <Link href="/admin/login" className="hover:text-paper-warm transition-colors">
            Area tecnica
          </Link>
        </div>
      </div>
    </footer>
  );
}