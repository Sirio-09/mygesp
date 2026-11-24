/**
 * Elenco e diagnostica delle variabili d'ambiente.
 *
 * NOTA: non lanciamo eccezioni all'avvio (lo farebbe crashare l'intero sito):
 * logghiamo invece un riepilogo chiaro, così gli errori "misteriosi" di Stripe
 * o Resend diventano immediatamente riconoscibili nei log.
 */

export const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
] as const;

export const OPTIONAL_ENV_VARS = [
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SITE_URL",
  "BLOB_READ_WRITE_TOKEN",
  "EMAIL_FROM",
  "TOTP_ENCRYPTION_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

const HINTS: Record<string, string> = {
  DATABASE_URL: "stringa di connessione PostgreSQL (es. postgresql://user:pass@host:5432/db)",
  NEXTAUTH_SECRET: "segreto per la firma dei JWT (genera con: openssl rand -base64 32)",
  STRIPE_SECRET_KEY: "chiave segreta Stripe (sk_test_... / sk_live_...)",
  STRIPE_WEBHOOK_SECRET: "segreto del webhook Stripe (whsec_...)",
  RESEND_API_KEY: "chiave API Resend (re_...) per l'invio delle email",
  BLOB_READ_WRITE_TOKEN: "token di Vercel Blob per l'upload immagini",
  NEXT_PUBLIC_SITE_URL: "URL pubblico del sito (es. https://mygesp.it)",
  NEXTAUTH_URL: "URL di base dell'app (es. http://localhost:3000)",
  EMAIL_FROM: "mittente delle email (es. MyGesp <info@mygesp.it>)",
  TOTP_ENCRYPTION_KEY:
    "chiave per cifrare i segreti 2FA a riposo (genera con: openssl rand -base64 32); se assente usa NEXTAUTH_SECRET",
  UPSTASH_REDIS_REST_URL:
    "URL REST di Upstash Redis / Vercel KV per il rate limiting distribuito (opzionale)",
  UPSTASH_REDIS_REST_TOKEN:
    "token REST di Upstash Redis / Vercel KV per il rate limiting distribuito (opzionale)",
};

export function getMissingEnvVars(): string[] {
  return REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
}

export function logEnvStatus(): void {
  const missing = getMissingEnvVars();

  if (missing.length === 0) {
    console.info("[env] Variabili d'ambiente obbligatorie: tutte presenti.");
    return;
  }

  console.warn(
    `[env] ATTENZIONE: ${missing.length} variabili obbligatorie mancanti. ` +
      "Le funzionalità che ne dipendono restituiranno errore finché non vengono configurate."
  );

  for (const key of missing) {
    console.warn(`[env]   - ${key}: ${HINTS[key] ?? "da configurare"}`);
  }
}

/** Utile nei test o in controlli espliciti: lancia se mancano variabili. */
export function validateEnv(): void {
  const missing = getMissingEnvVars();

  if (missing.length > 0) {
    throw new Error(
      `Variabili d'ambiente mancanti: ${missing
        .map((key) => `${key} (${HINTS[key] ?? "da configurare"})`)
        .join("; ")}`
    );
  }
}
