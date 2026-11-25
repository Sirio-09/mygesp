/**
 * Classi dei controlli di form dell'area tecnica: unica fonte di verità.
 *
 * Prima erano ricopiate in 4 file con differenze minime (placeholder troppo
 * chiari, focus su colori diversi, padding incoerenti). Qui si usano solo i
 * token della palette, il raggio resta 0 e il contrasto del placeholder è
 * quello di `text-ink-soft` al 60% (sufficiente su fondo bianco).
 */

export const labelClass =
  "block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft";

export const inputClass =
  "w-full border border-line bg-transparent px-4 py-3 text-sm font-light text-ink outline-none transition-colors duration-200 ease-out-expo placeholder:text-ink-soft/60 focus:border-grass-deep disabled:cursor-not-allowed disabled:opacity-50";

export const textareaClass = `${inputClass} resize-y`;

/** Select con freccia custom: il chiamante avvolge in `relative` e aggiunge ChevronDown. */
export const selectClass = `${inputClass} cursor-pointer appearance-none pr-11`;

/** Codice monouso / password temporanea: cifre allineate e molto spaziate. */
export const codeInputClass =
  "w-full border border-line bg-transparent px-4 py-3 text-center font-mono text-2xl tabular-nums tracking-[0.4em] text-ink outline-none transition-colors duration-200 ease-out-expo placeholder:text-ink-soft/40 focus:border-grass-deep disabled:cursor-not-allowed disabled:opacity-50";
