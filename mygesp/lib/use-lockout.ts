"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Gestione del blocco temporaneo dopo troppi tentativi 2FA errati.
 *
 * Il server risponde 429 con `lockedUntil` (ISO): qui teniamo il conto alla
 * rovescia e sblocchiamo il form da soli alla scadenza, senza obbligare
 * l'utente a ricaricare la pagina (con il solo `isLocked` booleano il form
 * restava disabilitato per sempre, anche a blocco scaduto).
 */

function secondsLeft(until: string): number {
  return Math.max(0, Math.ceil((new Date(until).getTime() - Date.now()) / 1000));
}

/** Formatta i secondi residui come `mm:ss`. */
export function formatLockoutTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function useLockoutCountdown() {
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const lock = useCallback(
    (until: string) => {
      stop();
      setLockedUntil(until);
      setRemaining(secondsLeft(until));

      intervalRef.current = window.setInterval(() => {
        const left = secondsLeft(until);
        setRemaining(left);

        if (left === 0) {
          stop();
          setLockedUntil(null);
        }
      }, 1000);
    },
    [stop]
  );

  useEffect(() => stop, [stop]);

  return { isLocked: lockedUntil !== null, remaining, lock };
}
