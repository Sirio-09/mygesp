"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function AccountMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return <span className="text-canvas text-sm">···</span>;
  }

  if (!session?.user) {
    return (
      <Link href="/account/login" className="text-canvas text-sm hover:text-signal">
        Accedi
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-canvas text-sm hover:text-signal"
      >
        {session.user.email?.split("@")[0]} ▾
      </button>
      {open && (
        <div className="absolute right-0 top-8 bg-white border border-mud shadow-lg py-2 min-w-[160px] z-50">
          <Link
            href="/account/ordini"
            className="block px-4 py-2 text-sm text-slate hover:bg-canvas"
            onClick={() => setOpen(false)}
          >
            I miei ordini
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full text-left px-4 py-2 text-sm text-rust hover:bg-canvas"
          >
            Esci
          </button>
        </div>
      )}
    </div>
  );
}