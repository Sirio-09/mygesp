import Link from "next/link";
import CartIcon from "./CartIcon";
import AccountMenu from "./AccountMenu";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  return (
    // IL SEGRETO E' QUI: z-40 la mantiene sopra ai contenuti normali della pagina, 
    // ma la fa "schiacciare" dal z-[999999] della galleria immagini quando la ingrandisci.
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-line/40 transition-colors duration-300">
      
      {/* Barra Annunci */}
      <div className="bg-ink text-white text-[9px] sm:text-[10px] text-center py-2.5 px-4 font-semibold uppercase tracking-[0.2em]">
        Spedizione gratuita sopra i 99€ · <span className="hidden sm:inline">consegna in tutta Italia e in Europa</span>
      </div>

      {/* Contenitore Principale Navigazione */}
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-10">
        <nav className="h-16 sm:h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 lg:gap-10">
            <MobileMenu />
            
            {/* Logo */}
            <Link 
              href="/" 
              className="text-ink text-xl sm:text-2xl tracking-[0.1em] shrink-0 uppercase flex items-center"
            >
              <span className="font-light">MY</span>
              <span className="font-medium">GESP</span>
            </Link>

            {/* Categorie affiancate al logo */}
            <ul className="hidden lg:flex items-center gap-8 ml-4">
              <li>
                <Link 
                  href="/categoria/abbigliamento" 
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft hover:text-ink transition-colors duration-300"
                >
                  Abbigliamento
                </Link>
              </li>
              <li>
                <Link 
                  href="/categoria/stivali" 
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft hover:text-ink transition-colors duration-300"
                >
                  Stivali
                </Link>
              </li>
              <li>
                <Link 
                  href="/categoria/attrezzature" 
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft hover:text-ink transition-colors duration-300"
                >
                  Attrezzature
                </Link>
              </li>
            </ul>
          </div>

          {/* Icone Azioni */}
          <div className="flex items-center gap-4 sm:gap-6">
            <SearchBar />
            <AccountMenu />
            <CartIcon />
          </div>
        </nav>
      </div>
    </header>
  );
}