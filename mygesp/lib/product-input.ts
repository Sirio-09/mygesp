import type { Prisma } from "@prisma/client";

export type RawVariantInput = {
  id?: string;
  size?: string;
  sku?: string;
  priceCents?: string | number | null;
  stock?: string | number | null;
};

export type RawProductInput = {
  name?: unknown;
  slug?: unknown;
  shortTitle?: unknown;
  shortDescription?: unknown;
  descriptionBlocks?: unknown;
  brand?: unknown;
  category?: unknown;
  activities?: unknown;
  images?: unknown;
  waterColumn?: unknown;
  minTemp?: unknown;
  featured?: unknown;
  discountPercent?: unknown;
  discountUntil?: unknown;
  variants?: unknown;
};

export type ParsedVariant = {
  id?: string;
  size: string;
  sku: string;
  priceCents: number;
  stock: number;
};

export type ParsedProduct = {
  name: string;
  slug: string;
  shortTitle: string | null;
  shortDescription: string | null;
  descriptionBlocks: Prisma.InputJsonValue;
  brand: string;
  category: string;
  activities: string[];
  images: string[];
  waterColumn: number | null;
  minTemp: number | null;
  featured: boolean;
  discountPercent: number | null;
  discountUntil: Date | null;
};

export type ParseResult =
  | { ok: true; data: ParsedProduct; variants: ParsedVariant[] }
  | { ok: false; error: string };

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function asOptionalInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function asDescriptionBlocks(value: unknown): Prisma.InputJsonValue {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (block): block is { title?: unknown; text?: unknown } =>
        typeof block === "object" && block !== null
    )
    .map((block) => ({
      title: asString(block.title),
      text: asString(block.text),
    }))
    .filter((block) => block.title.length > 0 || block.text.length > 0);
}

function asDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Normalizza e valida il payload di creazione/aggiornamento prodotto.
 * Restituisce messaggi d'errore parlanti invece di lasciar emergere
 * un PrismaClientValidationError generico (500) al client.
 */
export function parseProductInput(body: RawProductInput): ParseResult {
  const name = asString(body.name);
  const slug = asString(body.slug);
  const brand = asString(body.brand);
  const category = asString(body.category);

  if (!name) return { ok: false, error: "Il nome del prodotto è obbligatorio." };
  if (!slug) return { ok: false, error: "Lo slug del prodotto è obbligatorio." };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
    return {
      ok: false,
      error: "Lo slug può contenere solo lettere, numeri e trattini.",
    };
  }
  if (!brand) return { ok: false, error: "La marca è obbligatoria." };
  if (!category) return { ok: false, error: "La categoria è obbligatoria." };

  const rawVariants = Array.isArray(body.variants) ? body.variants : [];
  const variants: ParsedVariant[] = [];
  const seenSkus = new Set<string>();

  for (const raw of rawVariants as RawVariantInput[]) {
    const size = asString(raw?.size);
    const sku = asString(raw?.sku);

    if (!size || !sku) continue;

    if (seenSkus.has(sku)) {
      return { ok: false, error: `SKU duplicato nel form: ${sku}` };
    }
    seenSkus.add(sku);

    const priceCents = asOptionalInt(raw?.priceCents);
    const stock = asOptionalInt(raw?.stock);

    if (priceCents === null || priceCents < 0) {
      return {
        ok: false,
        error: `Prezzo non valido per la taglia ${size} (SKU ${sku}).`,
      };
    }

    if (stock === null || stock < 0) {
      return {
        ok: false,
        error: `Giacenza non valida per la taglia ${size} (SKU ${sku}).`,
      };
    }

    variants.push({
      id: asString(raw?.id) || undefined,
      size,
      sku,
      priceCents,
      stock,
    });
  }

  if (variants.length === 0) {
    return {
      ok: false,
      error: "Inserisci almeno una variante con taglia, SKU, prezzo e giacenza.",
    };
  }

  const discountPercent = asOptionalInt(body.discountPercent);

  if (discountPercent !== null && (discountPercent < 0 || discountPercent > 90)) {
    return {
      ok: false,
      error: "Lo sconto deve essere compreso tra 0 e 90.",
    };
  }

  const featured =
    body.featured === true ||
    body.featured === "true" ||
    body.featured === 1 ||
    body.featured === "1";

  return {
    ok: true,
    variants,
    data: {
      name,
      slug,
      shortTitle: asString(body.shortTitle) || null,
      shortDescription: asString(body.shortDescription) || null,
      descriptionBlocks: asDescriptionBlocks(body.descriptionBlocks),
      brand,
      category,
      activities: asStringArray(body.activities),
      images: asStringArray(body.images),
      waterColumn: asOptionalInt(body.waterColumn),
      minTemp: asOptionalInt(body.minTemp),
      featured,
      discountPercent,
      discountUntil: asDate(body.discountUntil),
    },
  };
}

/** Traduce gli errori Prisma più comuni in messaggi comprensibili. */
export function toFriendlyPrismaError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("Unique constraint") || message.includes("P2002")) {
    if (message.includes("slug")) {
      return "Esiste già un prodotto con questo slug: scegline un altro.";
    }
    if (message.includes("sku")) {
      return "Uno degli SKU inseriti è già usato da un'altra variante.";
    }
    return "Esiste già un record con questi dati (valore duplicato).";
  }

  if (
    message.includes("Record to update not found") ||
    message.includes("P2025")
  ) {
    return "Record non trovato: potrebbe essere stato eliminato nel frattempo.";
  }

  return message || "Errore inatteso durante il salvataggio.";
}
