"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function AccountMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (status === "loading") {
    return (
      <span
        className="block h-4 w-14 bg-line/50"
        aria-hidden="true"
      />
    );
  }

  // L'account menu privato si attiva SOLO per gli utenti con ruolo "customer"
  const isCustomer = session?.user?.role === "customer";

  if (!isCustomer) {
    return (
      <Link
        href="/account/login"
        className="link-underline text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors duration-300 ease-out-expo hover:text-grass-deep"
      >
        Accedi
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors duration-200 ease-out-expo hover:text-grass-deep"
      >
        <svg
          className="h-4 w-4 text-ink-soft"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span className="max-w-[110px] truncate normal-case tracking-normal">
          {session.user.email?.split("@")[0]}
        </span>
        <svg
          className={`h-3 w-3 text-ink-soft transition-transform duration-200 ease-out-expo ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6 9l6 6 6-6"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 min-w-[200px] origin-top-right animate-scale-in border border-line bg-paper py-1 shadow-[0_24px_48px_-32px_rgba(34,40,31,0.45)]"
        >
          <Link
            href="/account/ordini"
            role="menuitem"
            className="block px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors duration-200 hover:bg-paper-warm hover:text-ink"
            onClick={() => setOpen(false)}
          >
            I miei ordini
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full border-t border-line/60 px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.14em] text-soil-deep transition-colors duration-200 hover:bg-paper-warm"
          >
            Esci
          </button>
        </div>
      )}
    </div>
  );
}
