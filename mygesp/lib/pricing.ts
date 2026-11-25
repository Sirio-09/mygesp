/**
 * Regole di sconto e prezzo effettivo dei prodotti: unica fonte di verità
 * per vetrina, API catalogo, checkout e webhook Stripe.
 */

export type DiscountableProduct = {
  discountPercent?: number | null;
  discountUntil?: Date | string | null;
};

/** Restituisce true se il prodotto ha uno sconto percentuale valido e non scaduto. */
export function isProductDiscountActive(
  product: DiscountableProduct,
  now: Date = new Date()
): boolean {
  return Boolean(
    typeof product.discountPercent === "number" &&
      product.discountPercent > 0 &&
      (!product.discountUntil || new Date(product.discountUntil) > now)
  );
}

/** Applica l'eventuale sconto percentuale attivo al prezzo in centesimi. */
export function applyDiscountCents(
  priceCents: number,
  discountPercent: number | null | undefined
): number {
  if (!discountPercent || discountPercent <= 0) return priceCents;
  return Math.round((priceCents * (100 - discountPercent)) / 100);
}

/** Calcola il prezzo effettivo in centesimi di una variante. */
export function getEffectivePriceCents(
  variant: {
    priceCents: number;
    product: DiscountableProduct;
  },
  now: Date = new Date()
): number {
  if (isProductDiscountActive(variant.product, now)) {
    return applyDiscountCents(variant.priceCents, variant.product.discountPercent);
  }
  return variant.priceCents;
}
