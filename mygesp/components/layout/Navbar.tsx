import Link from "next/link";
import CartIcon from "./CartIcon";
import AccountMenu from "./AccountMenu";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-line">
      <div className="bg-grass-deep text-white text-[11px] sm:text-xs text-center py-1.5 px-4">
        Spedizione gratuita sopra i 99€ · <span className="hidden sm:inline">consegna in tutta Italia e in Europa</span>
      </div>

      <nav className="w-full px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MobileMenu />
          <Link href="/" className="text-ink text-xl sm:text-2xl font-extrabold tracking-tight">
            MY<span className="text-grass-deep">GESP</span>
          </Link>
        </div>

        <ul className="hidden lg:flex items-center gap-8">
          <li><Link href="/categoria/abbigliamento" className="text-ink-soft text-sm font-semibold hover:text-grass-deep transition-colors">Abbigliamento</Link></li>
          <li><Link href="/categoria/stivali" className="text-ink-soft text-sm font-semibold hover:text-grass-deep transition-colors">Stivali</Link></li>
          <li><Link href="/categoria/attrezzature" className="text-ink-soft text-sm font-semibold hover:text-grass-deep transition-colors">Attrezzature</Link></li>
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <SearchBar />
          <AccountMenu />
          <CartIcon />
        </div>
      </nav>
    </header>
  );
}