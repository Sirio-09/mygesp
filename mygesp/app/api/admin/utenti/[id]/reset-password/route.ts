import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();

    // 1. Verifica sessione e permessi Manager
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    if (!session.user?.isManager) {
      return NextResponse.json(
        { error: "Soltanto i Manager possono resettare la password." },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: "ID utente mancante" }, { status: 400 });
    }

    // 2. Genera una password temporanea sicura (8 caratteri casuali)
    const tempPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 3. Aggiorna l'utente imponendo il cambio password al prossimo accesso
    await prisma.admin.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
      },
    });

    return NextResponse.json({ tempPassword });
  } catch {
    return NextResponse.json(
      { error: "Errore durante il reset della password." },
      { status: 500 }
    );
  }
}