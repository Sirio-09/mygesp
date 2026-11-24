import crypto from "crypto";

/**
 * I codici di backup del 2FA non vengono mai salvati in chiaro:
 * nel database finisce solo l'hash SHA-256 del codice normalizzato.
 * Il confronto resta possibile perché l'input dell'utente è deterministico.
 */
function normalize(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update(normalize(code)).digest("hex");
}

/** Genera codici in chiaro (da mostrare all'utente) e i corrispondenti hash. */
export function generateBackupCodes(count = 8): {
  plain: string[];
  hashed: string[];
} {
  const plain: string[] = [];

  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
    plain.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }

  return { plain, hashed: plain.map(hashBackupCode) };
}

/**
 * Cerca l'indice del codice di backup usato.
 * Supporta anche i vecchi codici salvati in chiaro (migrazione trasparente).
 */
export function findBackupCodeIndex(stored: string[], input: string): number {
  const hashedInput = hashBackupCode(input);
  const normalizedInput = normalize(input);

  return stored.findIndex(
    (entry) => entry === hashedInput || normalize(entry) === normalizedInput
  );
}
