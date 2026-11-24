"use client";

// Reveal.tsx
// Wrapper client che attiva le transizioni d'ingresso definite in globals.css
// quando l'elemento entra nel viewport. Nessuna dipendenza esterna.
import { createElement, useEffect, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";

type RevealVariant = "up" | "fade" | "scale" | "img" | "line";

export default function Reveal({
  as = "div",
  variant = "up",
  delay = 0,
  once = true,
  className = "",
  children,
}: {
  as?: ElementType;
  variant?: RevealVariant;
  /** Ritardo in millisecondi, utile per gli stagger */
  delay?: number;
  once?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!node) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setRevealed(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, once]);

  const variantClass = variant === "up" ? "reveal" : `reveal-${variant}`;

  const style =
    delay > 0
      ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties)
      : undefined;

  return createElement(
    as,
    {
      ref: setNode,
      "data-revealed": revealed ? "true" : "false",
      className: `${variantClass} ${className}`.trim(),
      style,
    },
    children
  );
}
