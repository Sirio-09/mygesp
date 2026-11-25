/**
 * URL pubblico canonico del sito (senza slash finale).
 *
 * Unica fonte di verità: prima esistevano due implementazioni quasi identiche
 * (`getBaseUrl` qui e `getSiteUrl` in `lib/stripe.ts`) con normalizzazioni
 * diverse, quindi sitemap, link nelle email e `success_url` di Stripe potevano
 * puntare a URL differenti a partire dallo stesso valore d'ambiente.
 */

const FALLBACK = "http://localhost:3000";

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

export function getBaseUrl(): string {
  const raw = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL ||
    FALLBACK
  ).trim();

  const candidate = resolveSiteUrlCandidate(raw);

  if (!candidate) {
    console.error(
      `[site-url] NEXT_PUBLIC_SITE_URL non è un URL valido ("${raw}"): uso ${FALLBACK}.`
    );
    return FALLBACK;
  }

  try {
    const parsed = new URL(candidate);

    if (!parsed.hostname) throw new Error("hostname mancante");

    let base = `${parsed.origin}${parsed.pathname}`;

    while (base.endsWith("/")) base = base.slice(0, -1);

    if (candidate !== raw) {
      console.error(
        `[site-url] NEXT_PUBLIC_SITE_URL non è un URL pulito ("${raw}"): uso ${base}.`
      );
    }

    return base;
  } catch {
    console.error(
      `[site-url] NEXT_PUBLIC_SITE_URL non è un URL valido ("${raw}"): uso ${FALLBACK}.`
    );
    return FALLBACK;
  }
}

/** Alias storico usato dal codice Stripe/email: stesso comportamento. */
export const getSiteUrl = getBaseUrl;
