import type { ChangeEvent } from "react";

/**
 * Tipi condivisi dai due form prodotto (creazione e modifica).
 * I valori numerici restano stringhe finché non si invia: così il campo
 * può essere vuoto senza trasformarsi in 0.
 */

export type ProductFormState = {
  name: string;
  slug: string;
  shortTitle: string;
  shortDescription: string;
  brand: string;
  category: string;
  waterColumn: string;
  minTemp: string;
  featured: boolean;
  discountPercent: string;
  discountUntil: string;
};

export type DescriptionBlockInput = {
  title: string;
  text: string;
};

export type VariantInput = {
  size: string;
  sku: string;
  priceCents: string;
  stock: string;
};

export type ProductFieldChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;
