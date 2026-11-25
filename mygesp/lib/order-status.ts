/**
 * Stati ordine: unica fonte di verità per etichette e toni.
 *
 * I valori stringa sono quelli salvati su `Order.status` (default "pending"),
 * quindi NON vanno tradotti: solo le etichette cambiano lingua.
 * Il modulo è privo di dipendenze per essere importato sia da componenti
 * server (area personale) sia da componenti client (area tecnica).
 */

export type OrderStatusTone = "grass" | "soil" | "neutral";

/** Etichette italiane mostrate al cliente e allo staff. */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "In attesa",
  paid: "Pagato",
  processing: "In lavorazione",
  shipped: "Spedito",
  delivered: "Consegnato",
  canceled: "Annullato",
};

/** Toni semantici: verde = concluso, terra = in corso, neutro = chiuso. */
export const ORDER_STATUS_TONES: Record<string, OrderStatusTone> = {
  pending: "soil",
  paid: "grass",
  processing: "soil",
  shipped: "grass",
  delivered: "grass",
  canceled: "neutral",
};

/** Classi bordo/testo del badge, costruite solo sui token di palette. */
export const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatusTone, string> = {
  grass: "border-grass-deep/40 text-grass-deep",
  soil: "border-soil/50 text-soil-deep",
  neutral: "border-line text-ink-soft",
};

/** Opzioni per i menu a tendina dell'area tecnica (ordine di avanzamento). */
export const ORDER_STATUS_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "paid", label: ORDER_STATUS_LABELS.paid },
  { value: "processing", label: ORDER_STATUS_LABELS.processing },
  { value: "shipped", label: ORDER_STATUS_LABELS.shipped },
  { value: "delivered", label: ORDER_STATUS_LABELS.delivered },
  { value: "canceled", label: ORDER_STATUS_LABELS.canceled },
];

/** Etichetta sicura: se arriva uno stato sconosciuto non si mostra "undefined". */
export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
