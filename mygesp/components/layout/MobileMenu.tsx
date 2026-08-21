"use client";
import { useState } from "react";
import Link from "next/link";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="text-ink text-2xl leading-none"
        aria-label="Menu"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-line z-50 shadow-md">
          <ul className="flex flex-col">
            <li>
              <Link href="/categoria/abbigliamento" onClick={() => setOpen(false)}
                className="block px-6 py-3 text-ink-soft text-sm font-medium border-b border-line">
                Abbigliamento
              </Link>
            </li>
            <li>
              <Link href="/categoria/stivali" onClick={() => setOpen(false)}
                className="block px-6 py-3 text-ink-soft text-sm font-medium border-b border-line">
                Stivali
              </Link>
            </li>
            <li>
              <Link href="/categoria/attrezzature" onClick={() => setOpen(false)}
                className="block px-6 py-3 text-ink-soft text-sm font-medium">
                Attrezzature
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}