/**
 * Regole commerciali e formattazione prezzi: unica fonte di verità.
 *
 * Questi valori compaiono in barra annunci, carrello, drawer, checkout, API
 * di checkout e scheda prodotto: se cambiano, devono cambiare ovunque insieme.
 * Il modulo è volutamente privo di dipendenze server per poter essere importato
 * sia da componenti server sia da componenti client.
 */

/** Soglia oltre la quale la spedizione è gratuita: 99,00 €. */
export const FREE_SHIPPING_THRESHOLD_CENTS = 9900;

/**
 * Se true, la soglia di spedizione gratuita vale anche per isole e zone
 * disagiate. Comportamento attuale: sopra soglia la spedizione è gratuita
 * ovunque. Per tornare a far pagare la tariffa maggiorata alle isole anche
 * sopra i 99 € basta portare questa costante a false.
 */
export const FREE_SHIPPING_INCLUDES_REMOTE_ZONES = true;

/** Tariffa di spedizione standard in Italia: 6,90 €. */
export const BASE_SHIPPING_CENTS = 690;

/** Tariffa per isole e zone disagiate: 9,90 €. */
export const REMOTE_SHIPPING_CENTS = 990;

/** Finestra di recesso ex art. 52 del Codice del Consumo. */
export const RETURN_WINDOW_DAYS = 14;

/** Prefissi CAP (due cifre) di Sicilia, Sardegna e province disagiate. */
const REMOTE_CAP_PREFIXES = [
  "90",
  "91",
  "92",
  "93",
  "94",
  "95",
  "96",
  "97",
  "98",
  "07",
  "08",
  "09",
];

/** Prefisso CAP della laguna di Venezia (30100, 30121, ...). */
const VENICE_LAGOON_CAP_PREFIX = "301";

/** Un CAP italiano valido ha esattamente cinque cifre. */
const CAP_PATTERN = /^\d{5}$/;

/**
 * True se il CAP ricade in una zona con tariffa maggiorata
 * (Sicilia, Sardegna, province disagiate, laguna di Venezia).
 * Un CAP vuoto o non valido non è considerato zona remota.
 */
export function isRemoteZone(cap: string): boolean {
  const cleanCap = (cap ?? "").replace(/\D/g, "");

  if (!CAP_PATTERN.test(cleanCap)) return false;

  return (
    REMOTE_CAP_PREFIXES.includes(cleanCap.slice(0, 2)) ||
    cleanCap.startsWith(VENICE_LAGOON_CAP_PREFIX)
  );
}

/**
 * Spedizione in centesimi a partire dal subtotale e dal CAP di destinazione.
 * Usata sia dall'anteprima nel checkout sia dall'API che crea la sessione
 * Stripe: le due cifre non possono più divergere.
 */
export function calculateShippingCents(
  subtotalCents: number,
  cap: string
): number {
  const remote = isRemoteZone(cap);

  const isFreeShipping =
    subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS &&
    (FREE_SHIPPING_INCLUDES_REMOTE_ZONES || !remote);

  if (isFreeShipping) return 0;

  return remote ? REMOTE_SHIPPING_CENTS : BASE_SHIPPING_CENTS;
}

/** Etichetta della tariffa di spedizione mostrata nel checkout Stripe. */
export function getShippingLabel(shippingCents: number): string {
  if (shippingCents === 0) return "Spedizione Gratuita";
  if (shippingCents === REMOTE_SHIPPING_CENTS) {
    return "Spedizione Isole e Zone Disagiate";
  }
  return "Spedizione Standard Italia";
}

/** Formato usato nello storefront: "€129.00". */
export function formatEuro(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/** Formato compatto per i testi: "99€" (senza decimali quando la cifra è tonda). */
export function formatEuroCompact(cents: number): string {
  return cents % 100 === 0 ? `${cents / 100}€` : `${(cents / 100).toFixed(2)}€`;
}
