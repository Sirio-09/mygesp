// BackButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors duration-300 ease-out-expo hover:text-grass-deep"
    >
      <svg
        className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:-translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
      <span>Torna al catalogo</span>
    </button>
  );
}