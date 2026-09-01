"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-soft hover:text-grass-deep transition-colors group cursor-pointer"
    >
      <svg
        className="w-4 h-4 text-ink-soft group-hover:text-grass-deep group-hover:-translate-x-1 transition-all duration-200"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
      <span>Indietro</span>
    </button>
  );
}