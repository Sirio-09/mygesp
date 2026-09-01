"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="group flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink-soft hover:text-soil-deep hover:bg-soil-deep/10 rounded-md transition-all w-full sm:w-auto"
      title="Esci dal tuo account"
    >
      <svg 
        className="w-4 h-4 transition-transform group-hover:-translate-x-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Esci
    </button>
  );
}