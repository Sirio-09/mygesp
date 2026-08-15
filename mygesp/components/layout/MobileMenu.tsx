"use client";
import { useState } from "react";
import Link from "next/link";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="text-canvas text-2xl leading-none"
        aria-label="Menu"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-loden border-t border-rust z-50">
          <ul className="flex flex-col">
            <li>
              <Link href="/categoria/abbigliamento" onClick={() => setOpen(false)}
                className="block px-6 py-3 text-canvas-deep text-sm font-medium uppercase tracking-wide border-b border-loden-deep">
                Abbigliamento
              </Link>
            </li>
            <li>
              <Link href="/categoria/stivali" onClick={() => setOpen(false)}
                className="block px-6 py-3 text-canvas-deep text-sm font-medium uppercase tracking-wide border-b border-loden-deep">
                Stivali
              </Link>
            </li>
            <li>
              <Link href="/categoria/attrezzature" onClick={() => setOpen(false)}
                className="block px-6 py-3 text-canvas-deep text-sm font-medium uppercase tracking-wide">
                Attrezzature
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}