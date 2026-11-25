"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "@/components/admin/ui/icons";

/**
 * Uscita dall'area tecnica.
 * Stile allineato ai link della topbar: niente ombre né angoli arrotondati,
 * solo testo 10px con tracking largo e icona con stroke 1.5.
 */
export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors duration-300 ease-out-expo hover:text-soil-deep"
      title="Esci dal tuo account"
    >
      <LogOut className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:-translate-x-0.5" />
      Esci
    </button>
  );
}
