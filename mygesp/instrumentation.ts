/**
 * Eseguito una volta all'avvio del server Next.js.
 * Stampa un riepilogo delle variabili d'ambiente mancanti: è il primo posto
 * da guardare se Stripe, Resend o il database "non funzionano".
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { logEnvStatus } = await import("./lib/env");
  logEnvStatus();

  const { isDistributedRateLimiterEnabled } = await import("./lib/rate-limiter");
  if (isDistributedRateLimiterEnabled()) {
    console.info("[rate-limiter] Store distribuito (Upstash/Vercel KV) attivo.");
  } else {
    console.warn(
      "[rate-limiter] Nessuno store distribuito configurato: il rate limiting usa la memoria del processo. " +
        "Su ambienti multi-istanza (es. Vercel) imposta UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN."
    );
  }
}
