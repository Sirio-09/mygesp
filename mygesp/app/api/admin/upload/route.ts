import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Riconosce il formato dai primi byte del file (magic numbers).
 *
 * `file.type` è dichiarato dal client e può essere falsificato: senza questo
 * controllo un file HTML/SVG poteva essere caricato come "image/png" e servito
 * pubblicamente dallo storage, con rischio di XSS sull'host del blob.
 */
async function detectImageType(file: File): Promise<string | null> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  const startsWith = (signature: number[], offset = 0) =>
    signature.every((byte, index) => bytes[offset + index] === byte);

  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (startsWith([0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (
    startsWith([0x52, 0x49, 0x46, 0x46]) && // "RIFF"
    startsWith([0x57, 0x45, 0x42, 0x50], 8) // "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let file: File | null = null;

  try {
    const formData = await req.formData();
    const entry = formData.get("file");
    file = entry instanceof File ? entry : null;
  } catch {
    return NextResponse.json(
      { error: "Richiesta non valida: impossibile leggere il file." },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json({ error: "Nessun file inviato" }, { status: 400 });
  }

  // Validazione dimensione
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File troppo grande. Dimensione massima: 5 MB." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Il file è vuoto." }, { status: 400 });
  }

  // Il tipo viene determinato dal contenuto, non dall'header del client.
  const detectedType = await detectImageType(file);

  if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType)) {
    return NextResponse.json(
      {
        error:
          "Tipo di file non consentito. Sono ammesse solo immagini (JPEG, PNG, WebP, GIF).",
      },
      { status: 400 }
    );
  }

  // Nome file sanitizzato e normalizzato sull'estensione reale del contenuto.
  const baseName =
    file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60) || "immagine";
  const safeName = `${baseName}.${EXTENSIONS[detectedType]}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Upload non configurato: manca BLOB_READ_WRITE_TOKEN nel file .env.local.",
      },
      { status: 503 }
    );
  }

  try {
    const blob = await put(safeName, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: detectedType,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Errore upload su Vercel Blob:", err);
    return NextResponse.json(
      { error: "Errore durante il caricamento del file. Riprova." },
      { status: 500 }
    );
  }
}
