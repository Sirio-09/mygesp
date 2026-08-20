import Link from "next/link";
import CartIcon from "./CartIcon";
import AccountMenu from "./AccountMenu";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  return (
    <nav className="bg-paper border-b border-line sticky top-0 z-40">
      <div className="w-full px-4 md:px-8 h-18 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <MobileMenu />
          <Link href="/" className="text-ink text-2xl font-bold tracking-tight">
            MyGesp
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 px-8 border-x border-line h-10">
          <Link href="/categoria/abbigliamento" className="text-ink-soft text-sm font-medium hover:text-forest transition-colors">Abbigliamento</Link>
          <Link href="/categoria/stivali" className="text-ink-soft text-sm font-medium hover:text-forest transition-colors">Stivali</Link>
          <Link href="/categoria/attrezzature" className="text-ink-soft text-sm font-medium hover:text-forest transition-colors">Attrezzature</Link>
        </div>

        <div className="flex items-center gap-4 bg-paper-deep/50 px-3 py-2 rounded-full">
          <SearchBar />
          <div className="w-px h-5 bg-line" />
          <AccountMenu />
          <CartIcon />
        </div>
      </div>
    </nav>
  );
}