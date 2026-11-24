"use client";

// template.tsx
// Transizione d'ingresso a ogni navigazione: solo opacity, così nessun
// transform residuo può rompere `position: sticky` nei contenuti.
import { useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const [isAnimating, setIsAnimating] = useState(true);

  return (
    <div
      className={isAnimating ? "animate-page-in" : undefined}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setIsAnimating(false);
      }}
    >
      {children}
    </div>
  );
}
