import type { Metadata } from "next";

/**
 * Metadata per le pagine private (carrello, checkout, area personale, ...):
 * titolo dedicato e nessuna indicizzazione. `follow` resta attivo dove i link
 * al catalogo devono rimanere scopribili dai crawler.
 */
export function privatePageMetadata(
  pageTitle: string,
  { follow = false }: { follow?: boolean } = {}
): Metadata {
  return {
    title: `${pageTitle} — MyGesp`,
    robots: { index: false, follow },
  };
}
