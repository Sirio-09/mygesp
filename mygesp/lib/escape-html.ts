/**
 * Escape per i valori interpolati nelle email HTML.
 *
 * I dati arrivano dall'esterno (nome prodotto, indirizzo, corriere, codice di
 * tracking): senza escape una virgoletta o un `<` rompe il markup dell'email, e
 * in un client che interpreta l'HTML può diventare un'iniezione.
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";

  return String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);
}
