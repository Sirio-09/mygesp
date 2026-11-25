"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import LogoutButton from "@/components/layout/LogoutButton";
import { ArrowUpRight, Menu } from "./ui/icons";

/**
 * Intelaiatura dell'area tecnica: topbar sticky, navigazione con stato attivo,
 * chip utente, menu mobile e footer minimale.
 *
 * Le schermate di autenticazione (login, 2FA, recupero) restano fuori da
 * questa cornice: hanno bisogno di tutta l'attenzione e di nessun link.
 */

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/ordini", label: "Ordini" },
  { href: "/admin/nuovo-prodotto", label: "Nuovo prodotto" },
  { href: "/admin/utenti", label: "Staff" },
  { href: "/admin/sicurezza", label: "Account" },
];

const AUTH_ROUTES = [
  "/admin/login",
  "/admin/2fa-setup",
  "/admin/2fa-verify",
  "/admin/2fa-recovery",
];

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SessionUser = {
  name?: string | null;
  email?: string | null;
  isManager?: boolean;
};

export default function AdminChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/admin";
  const { data: session } = useSession();
  const mobileMenuRef = useRef<HTMLDetailsElement | null>(null);

  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  const user = session?.user as SessionUser | undefined;
  const displayName = user?.name ?? user?.email ?? "Staff";
  const initials = displayName.slice(0, 2).toUpperCase();

  const closeMobileMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:border focus:border-line focus:bg-paper focus:px-4 focus:py-2 focus:text-[10px] focus:font-semibold focus:uppercase focus:tracking-[0.2em] focus:text-ink"
      >
        Vai al contenuto
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-20">
          {/* Brand + contesto */}
          <div className="flex min-w-0 items-center gap-4 lg:gap-8">
            <Link
              href="/admin"
              className="flex shrink-0 items-center text-xl uppercase tracking-[0.1em] text-ink transition-opacity duration-300 hover:opacity-70 sm:text-2xl"
            >
              <span className="font-light">MY</span>
              <span className="font-medium">GESP</span>
            </Link>

            <span
              className="hidden h-5 w-px shrink-0 bg-line sm:block"
              aria-hidden="true"
            />

            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft sm:block">
              Area tecnica
            </span>
          </div>

          {/* Navigazione desktop */}
          <nav aria-label="Navigazione area tecnica" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`link-underline text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ease-out-expo ${
                        active ? "text-ink" : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Azioni */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-3 lg:flex">
              <span
                className="flex h-8 w-8 items-center justify-center border border-line text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-soft"
                aria-hidden="true"
              >
                {initials}
              </span>
              <div className="min-w-0">
                <p className="max-w-[140px] truncate text-xs font-light text-ink">
                  {displayName}
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  {user?.isManager ? "Manager" : "Staff"}
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="hidden items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors duration-300 hover:text-ink md:inline-flex"
            >
              mygesp.it
              <ArrowUpRight className="h-3 w-3" />
            </Link>

            <span
              className="hidden h-5 w-px bg-line lg:block"
              aria-hidden="true"
            />

            <div className="hidden lg:block">
              <LogoutButton />
            </div>

            {/* Menu mobile */}
            <details ref={mobileMenuRef} className="relative lg:hidden">
              <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center border border-line text-ink transition-colors duration-200 hover:border-ink [&::-webkit-details-marker]:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">
                  Apri il menu dell&apos;area tecnica
                </span>
              </summary>

              <div className="absolute right-0 top-full z-50 mt-2 w-64 border border-line bg-paper p-2">
                <nav aria-label="Navigazione area tecnica (mobile)">
                  <ul>
                    {NAV_ITEMS.map((item) => {
                      const active = isActive(pathname, item.href);

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={closeMobileMenu}
                            aria-current={active ? "page" : undefined}
                            className={`block px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ${
                              active
                                ? "bg-paper-warm/60 text-ink"
                                : "text-ink-soft hover:text-ink"
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="mt-2 border-t border-line/60 pt-2">
                  <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors duration-200 hover:text-ink"
                  >
                    mygesp.it
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                  <div className="px-3 py-1">
                    <LogoutButton />
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main id="admin-content" className="flex-1">
        <div className="container-page py-10 lg:py-14">{children}</div>
      </main>

      <footer className="border-t border-line/60">
        <div className="container-page flex flex-col gap-2 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-light uppercase tracking-[0.2em] text-ink-soft">
            MyGesp &middot; Area tecnica
          </p>
          <p className="text-[10px] font-light uppercase tracking-[0.2em] text-ink-soft">
            Accesso riservato &middot; P.IVA 04093030049
          </p>
        </div>
      </footer>
    </div>
  );
}

