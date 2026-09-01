// BackButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft hover:text-grass transition-colors"
    >
      <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
        &larr;
      </span>
      <span>Torna al catalogo</span>
    </button>
  );
}