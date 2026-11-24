import Link from "next/link";
import CartIcon from "./CartIcon";
import AccountMenu from "./AccountMenu";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";

const categories = [
  { name: "Abbigliamento", href: "/categoria/abbigliamento" },
  { name: "Stivali", href: "/categoria/stivali" },
  { name: "Attrezzature", href: "/categoria/attrezzature" },
];

export default function Navbar() {
  return (
    // IL SEGRETO E' QUI: z-40 la mantiene sopra ai contenuti normali della pagina,
    // ma la fa "schiacciare" dal z-[999999] della galleria immagini quando la ingrandisci.
    <header className="sticky top-0 z-40 border-b border-line/40 bg-paper/90 backdrop-blur-md">
      {/* Barra Annunci */}
      <div className="bg-ink">
        <div className="mx-auto flex max-w-[1280px] items-center justify-center px-4 py-2 text-center sm:px-6 lg:px-10">
          <p className="text-[10px] font-medium uppercase leading-none tracking-[0.18em] text-white/90">
            Spedizione gratuita sopra i 99€ ·{" "}
            <span className="hidden text-white/60 sm:inline">
              consegna in tutta Italia e in Europa
            </span>
          </p>
        </div>
      </div>

      {/* Contenitore Principale Navigazione */}
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <nav className="flex h-16 items-center justify-between gap-4 sm:h-20">
          <div className="flex items-center gap-4 lg:gap-10">
            <MobileMenu />

            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-center text-xl uppercase tracking-[0.1em] text-ink transition-opacity duration-300 hover:opacity-70 sm:text-2xl"
            >
              <span className="font-light">MY</span>
              <span className="font-medium">GESP</span>
            </Link>

            {/* Categorie affiancate al logo */}
            <ul className="ml-4 hidden items-center gap-8 md:flex">
              {categories.map((category) => (
                <li key={category.href}>
                  <Link
                    href={category.href}
                    className="link-underline text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors duration-300 ease-out-expo hover:text-ink"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
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
