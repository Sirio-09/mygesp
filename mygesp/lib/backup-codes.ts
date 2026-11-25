import crypto from "crypto";

/**
 * I codici di backup del 2FA non vengono mai salvati in chiaro.
 *
 * L'hash è un **HMAC-SHA256 con il segreto del server**, non un semplice
 * SHA-256: i codici hanno entropia limitata (poche decine di bit), quindi con
 * un hash non keyed un dump del database basterebbe per brute-forzarli offline.
 * Restano validi anche gli hash SHA-256 generati dalle versioni precedenti
 * (migrazione trasparente: si consumano e vengono rigenerati in HMAC).
 */
function normalize(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function getKey(): string {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.TOTP_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET/NEXTAUTH_SECRET non configurato: impossibile proteggere i codici di recupero."
    );
  }

  return secret;
}

export function hashBackupCode(code: string): string {
  return crypto
    .createHmac("sha256", getKey())
    .update(normalize(code))
    .digest("hex");
}

/** Formato storico (SHA-256 non keyed), accettato solo in lettura. */
function legacyHash(code: string): string {
  return crypto.createHash("sha256").update(normalize(code)).digest("hex");
}

/** Genera codici in chiaro (da mostrare all'utente) e i corrispondenti hash. */
export function generateBackupCodes(count = 8): {
  plain: string[];
  hashed: string[];
} {
  const plain: string[] = [];

  for (let i = 0; i < count; i++) {
    // 6 byte = 48 bit di entropia, formattati XXXXXX-XXXXXX.
    const raw = crypto.randomBytes(6).toString("hex").toUpperCase();
    plain.push(`${raw.slice(0, 6)}-${raw.slice(6)}`);
  }

  return { plain, hashed: plain.map(hashBackupCode) };
}

/**
 * Cerca l'indice del codice di backup usato.
 * Supporta anche i vecchi codici salvati in chiaro o con SHA-256 non keyed.
 */
export function findBackupCodeIndex(stored: string[], input: string): number {
  const normalizedInput = normalize(input);

  if (!normalizedInput) return -1;

  const hashedInput = hashBackupCode(input);
  const legacyHashedInput = legacyHash(input);

  return stored.findIndex(
    (entry) =>
      entry === hashedInput ||
      entry === legacyHashedInput ||
      normalize(entry) === normalizedInput
  );
}
