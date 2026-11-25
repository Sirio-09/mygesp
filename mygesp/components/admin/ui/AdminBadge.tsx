import type { ReactNode } from "react";

/**
 * Etichetta di stato: bordo 1px, raggio 0, testo 9px con tracking largo.
 * I toni sono semantici e usano solo i token della palette.
 */

export type BadgeTone = "neutral" | "grass" | "soil";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line text-ink-soft",
  grass: "border-grass-deep/40 text-grass-deep",
  soil: "border-soil/50 text-soil-deep",
};

export default function AdminBadge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-[9px] font-semibold uppercase leading-4 tracking-[0.16em] ${tones[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
