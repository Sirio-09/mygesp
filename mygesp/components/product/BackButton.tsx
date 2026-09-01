"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-white border border-[#e2ded6] hover:bg-paper-warm text-ink text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
    >
      <span className="text-sm leading-none">←</span>
      <span>Torna al catalogo</span>
    </button>
  );
}