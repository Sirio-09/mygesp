import Link from "next/link";
import CartIcon from "./CartIcon";
import AccountMenu from "./AccountMenu";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b border-line shadow-sm">
      {/* Barra Annunci */}
      <div className="bg-grass-deep text-white text-[11px] sm:text-xs text-center py-2 px-4 font-medium tracking-wide">
        Spedizione gratuita sopra i 99€ · <span className="hidden sm:inline">consegna in tutta Italia e in Europa</span>
      </div>

      {/* Contenitore Principale Navigazione */}
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-10">
        <nav className="h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo e Menu Mobile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <MobileMenu />
            <Link 
              href="/" 
              className="text-ink text-xl sm:text-2xl font-extrabold tracking-tight hover:opacity-90 transition-opacity"
            >
              MY<span className="text-grass-deep">GESP</span>
            </Link>
          </div>

          {/* Link Categorie Principali */}
          <ul className="hidden lg:flex items-center gap-8">
            <li>
              <Link 
                href="/categoria/abbigliamento" 
                className="relative py-1 text-ink-soft text-sm font-semibold hover:text-grass-deep transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-grass-deep hover:after:w-full after:transition-all after:duration-200"
              >
                Abbigliamento
              </Link>
            </li>
            <li>
              <Link 
                href="/categoria/stivali" 
                className="relative py-1 text-ink-soft text-sm font-semibold hover:text-grass-deep transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-grass-deep hover:after:w-full after:transition-all after:duration-200"
              >
                Stivali
              </Link>
            </li>
            <li>
              <Link 
                href="/categoria/attrezzature" 
                className="relative py-1 text-ink-soft text-sm font-semibold hover:text-grass-deep transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-grass-deep hover:after:w-full after:transition-all after:duration-200"
              >
                Attrezzature
              </Link>
            </li>
          </ul>

          {/* Icone Azioni */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SearchBar />
            <AccountMenu />
            <CartIcon />
          </div>
        </nav>
      </div>
    </header>
  );
}