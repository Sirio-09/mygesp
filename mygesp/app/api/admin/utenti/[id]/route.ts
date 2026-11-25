import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin-guard";

/** Stesso limite di bcrypt: oltre 72 byte la password viene troncata. */
const MAX_PASSWORD_LENGTH = 72;

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin({ requireManager: true });
  if (!guard.ok) return guard.response;

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID utente mancante" }, { status: 400 });
  }

  // Per la propria password esiste l'area Sicurezza, che chiede quella attuale:
  // senza questo blocco un manager con sessione rubata poteva cambiare la
  // propria password e prendere il controllo dell'account.
  if (id === guard.adminId) {
    return NextResponse.json(
      { error: "Usa l'area Account e sicurezza per cambiare la tua password." },
      { status: 400 }
    );
  }

  let body: { password?: unknown };

  try {
    body = (await req.json()) as { password?: unknown };
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";

  if (password.length < 8 || password.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: "Password di almeno 8 caratteri richiesta (massimo 72)." },
      { status: 400 }
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.admin.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword: true, // L'utente dovrà comunque cambiarla al prossimo accesso
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Errore aggiornamento utente admin:", err);
    return NextResponse.json(
      { error: "Impossibile aggiornare l'utente richiesto." },
      { status: 404 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin({ requireManager: true });
  if (!guard.ok) return guard.response;

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID utente mancante" }, { status: 400 });
  }

  if (id === guard.adminId) {
    return NextResponse.json(
      { error: "Non puoi eliminare il tuo stesso account" },
      { status: 400 }
    );
  }

  try {
    await prisma.admin.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Errore eliminazione utente admin:", err);
    return NextResponse.json(
      { error: "Utente non trovato o non eliminabile." },
      { status: 404 }
    );
  }
}
