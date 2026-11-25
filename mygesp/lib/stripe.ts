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
 * URL pubblico del sito, normalizzato (senza slash finale).
 * Usato per success_url / cancel_url delle sessioni Stripe e per i link email.
 *
 * L'implementazione (con fallback e pulizia dei valori d'ambiente sporchi) vive
 * in `lib/baseUrl.ts`: qui la riesportiamo soltanto, così sitemap, email e
 * Stripe non possono divergere.
 */
export { getSiteUrl } from "@/lib/baseUrl";
