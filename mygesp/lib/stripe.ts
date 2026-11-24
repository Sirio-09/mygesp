import Stripe from "stripe";

/**
 * Client Stripe inizializzato in modo lazy.
 *
 * Il costruttore di Stripe lancia un errore se la chiave API manca: creare
 * l'istanza a livello di modulo faceva crashare l'intera route (500) quando
 * `STRIPE_SECRET_KEY` non era configurata. In questo modo l'errore viene
 * restituito in modo controllato solo quando si prova davvero a usare Stripe.
 */
let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY non configurata: aggiungila al file .env.local per abilitare i pagamenti."
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET non configurata: impossibile verificare i webhook Stripe."
    );
  }

  return webhookSecret;
}

/**
 * Estrae un URL utilizzabile da un valore d'ambiente "sporco".
 *
 * Capita di incollare nel .env un link Markdown
 * (`[https://sito.it](https://sito.it)`) o un host senza schema: in entrambi i
 * casi l'URL finirebbe dentro `success_url` di Stripe e la sessione verrebbe
 * rifiutata con un errore opaco ("Not a valid URL").
 */
function resolveSiteUrlCandidate(raw: string): string | null {
  // Ripuliamo virgolette/parentesi incollate per errore attorno al valore.
  const cleaned = raw.trim().replace(/^["'<(\s]+|["'>)\s]+$/g, "");

  const embedded = cleaned.match(/https?:\/\/[^\s)\]"']+/i);

  if (embedded) return embedded[0].replace(/[.,;:]+$/, "");

  // Host nudo ("sito.it", "localhost:3000") → aggiungiamo lo schema.
  if (/^[a-z0-9.-]+(:\d+)?(\/.*)?$/i.test(cleaned)) {
    const scheme = /^(localhost|127\.0\.0\.1)/i.test(cleaned) ? "http" : "https";
    return `${scheme}://${cleaned}`;
  }

  return null;
}

/**
 * URL pubblico del sito, normalizzato (senza slash finale).
 * Usato per success_url / cancel_url delle sessioni Stripe e per i link email.
 *
 * Se `NEXT_PUBLIC_SITE_URL` non contiene un URL valido si ripiega su
 * NEXTAUTH_URL / AUTH_URL e infine su localhost, così un errore di
 * configurazione non blocca i pagamenti con un messaggio incomprensibile.
 */
export function getSiteUrl(): string {
  const fallback = "http://localhost:3000";

  const raw = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL ||
    fallback
  ).trim();

  const candidate = resolveSiteUrlCandidate(raw);

  if (!candidate) {
    console.error(
      `[stripe] NEXT_PUBLIC_SITE_URL non è un URL valido ("${raw}"): uso ${fallback}.`
    );
    return fallback;
  }

  try {
    const parsed = new URL(candidate);

    if (!parsed.hostname) throw new Error("hostname mancante");

    let base = `${parsed.origin}${parsed.pathname}`;

    while (base.endsWith("/")) base = base.slice(0, -1);

    if (candidate !== raw) {
      console.error(
        `[stripe] NEXT_PUBLIC_SITE_URL non è un URL pulito ("${raw}"): uso ${base}.`
      );
    }

    return base;
  } catch {
    console.error(
      `[stripe] NEXT_PUBLIC_SITE_URL non è un URL valido ("${raw}"): uso ${fallback}.`
    );
    return fallback;
  }
}
