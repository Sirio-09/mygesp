import Link from "next/link";
import CartIcon from "./CartIcon";
import AccountMenu from "./AccountMenu";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  return (
    <>
      <div className="bg-loden-deep text-canvas text-[11px] md:text-[13px] text-center py-2 px-4">
        Spedizione gratuita sopra i 99€ · consegna in tutta Italia{" "}
        <span className="text-signal hidden sm:inline">· testato in stalla, non in laboratorio</span>
      </div>

      <nav className="bg-loden py-4 md:py-7 border-b-[3px] border-rust relative">
        <div className="w-full px-4 md:px-6 flex md:grid md:grid-cols-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <MobileMenu />
            <Link href="/" className="text-canvas text-2xl md:text-4xl font-bold tracking-wide font-display">
              MY<span className="text-rust">GESP</span>
            </Link>
          </div>

          <ul className="hidden md:flex gap-10 list-none justify-center">
            <li><Link href="/categoria/abbigliamento" className="text-canvas-deep text-base font-medium uppercase tracking-wide hover:text-signal">Abbigliamento</Link></li>
            <li><Link href="/categoria/stivali" className="text-canvas-deep text-base font-medium uppercase tracking-wide hover:text-signal">Stivali</Link></li>
            <li><Link href="/categoria/attrezzature" className="text-canvas-deep text-base font-medium uppercase tracking-wide hover:text-signal">Attrezzature</Link></li>
          </ul>

          <div className="flex items-center gap-2 md:gap-4 justify-end">
            <SearchBar />
            <AccountMenu />
            <CartIcon />
          </div>
        </div>
      </nav>
    </>
  );
}