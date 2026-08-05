import Link from "next/link";
import CartIcon from "./CartIcon";
import AccountMenu from "./AccountMenu";

export default function Navbar() {
  return (
    <>
      <div className="bg-loden-deep text-canvas text-[13px] text-center py-2 px-4">
        Spedizione gratuita sopra i 99€ · consegna in tutta Italia{" "}
        <span className="text-signal">· testato in stalla, non in laboratorio</span>
      </div>

      <nav className="bg-loden py-[18px] border-b-[3px] border-rust">
        <div className="max-w-[1200px] mx-auto px-8 flex items-center justify-between gap-8">
          <Link href="/" className="text-canvas text-2xl font-bold tracking-wide font-display">
            MY<span className="text-rust">GESP</span>
          </Link>
          <ul className="hidden md:flex gap-7 list-none">
            <li><Link href="/categoria/abbigliamento" className="text-canvas-deep text-sm font-medium uppercase tracking-wide hover:text-signal">Abbigliamento</Link></li>
            <li><Link href="/categoria/stivali" className="text-canvas-deep text-sm font-medium uppercase tracking-wide hover:text-signal">Stivali</Link></li>
            <li><Link href="/categoria/attrezzature" className="text-canvas-deep text-sm font-medium uppercase tracking-wide hover:text-signal">Attrezzature</Link></li>
            <li><a href="#" className="text-canvas-deep text-sm font-medium uppercase tracking-wide hover:text-signal">Per attività ▾</a></li>
            <li><a href="#" className="text-canvas-deep text-sm font-medium uppercase tracking-wide hover:text-signal">Marchi</a></li>
            <li><a href="#" className="text-canvas-deep text-sm font-medium uppercase tracking-wide hover:text-signal">Offerte</a></li>
          </ul>
          <div className="text-canvas text-lg flex gap-4 items-center">
            <span>⌕</span>
            <AccountMenu />
            <CartIcon />
          </div>
        </div>
      </nav>
    </>
  );
}