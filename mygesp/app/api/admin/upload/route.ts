import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Nessun file inviato" }, { status: 400 });
  }

  // Validazione tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo di file non consentito. Sono ammesse solo immagini (JPEG, PNG, WebP, GIF)." },
      { status: 400 }
    );
  }

  // Validazione dimensione
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File troppo grande. Dimensione massima: 5 MB." },
      { status: 400 }
    );
  }

  // Sanitizza il nome file: rimuovi caratteri pericolosi e spazi
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").replace(/\s+/g, "_");

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