import type { ReactNode } from "react";
import { Alert, Check } from "./icons";

/**
 * Messaggio di feedback in linea.
 * `danger` usa soil-deep (palette del sito) al posto dei rossi di default,
 * così anche gli errori restano coerenti con le altre pagine.
 */

export type AlertTone = "danger" | "success" | "neutral";

const tones: Record<AlertTone, { box: string; icon: ReactNode }> = {
  danger: {
    box: "border-soil/50 bg-soil/5 text-soil-deep",
    icon: <Alert className="h-3.5 w-3.5 shrink-0" />,
  },
  success: {
    box: "border-grass-deep/40 bg-grass/5 text-grass-deep",
    icon: <Check className="h-3.5 w-3.5 shrink-0" />,
  },
  neutral: {
    box: "border-line bg-paper-warm/40 text-ink",
    icon: null,
  },
};

export default function AdminAlert({
  children,
  tone = "neutral",
  title,
  className = "",
}: {
  children: ReactNode;
  tone?: AlertTone;
  title?: string;
  className?: string;
}) {
  const style = tones[tone];

  return (
    <div
      role={tone === "neutral" ? "status" : "alert"}
      className={`flex gap-3 border px-4 py-3 text-xs font-light leading-relaxed ${style.box} ${className}`.trim()}
    >
      {style.icon}
      <div className="min-w-0">
        {title && (
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em]">
            {title}
          </span>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
