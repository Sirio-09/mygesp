import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { rateLimitResponse } from "@/lib/rate-limiter";
import { clearAdmin2fa, requireAdmin } from "@/lib/admin-guard";
import { getClientIp } from "@/lib/request-ip";

const MAX_PASSWORD_LENGTH = 72;

export async function POST(req: Request) {
  // Unico endpoint (con il bootstrap del 2FA) accessibile anche quando la
  // password è ancora temporanea o il secondo fattore non è stato completato.
  const guard = await requireAdmin({
    allowUnverified2fa: true,
    allowPendingPasswordChange: true,
  });
  if (!guard.ok) return guard.response;

  const userId = guard.adminId;

  // Difesa in profondità: limita i tentativi di indovinare la password attuale.
  const limited = await rateLimitResponse(
    `password-change:${getClientIp(req)}`,
    10,
    15 * 60 * 1000
  );
  if (limited) return limited;

  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword) {
    return NextResponse.json(
      { error: "Inserisci la password attuale" },
      { status: 400 }
    );
  }

  if (newPassword.length < 8 || newPassword.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: "La password deve contenere da 8 a 72 caratteri" },
      { status: 400 }
    );
  }

  const admin = await prisma.admin.findUnique({ where: { id: userId } });

  if (!admin) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  const validCurrent = await bcrypt.compare(currentPassword, admin.password);

  if (!validCurrent) {
    return NextResponse.json(
      { error: "La password attuale non è corretta" },
      { status: 400 }
    );
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "La nuova password deve essere diversa da quella attuale" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.admin.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      mustChangePassword: false,
    },
  });

  // Cambiare password invalida la prova 2FA: la sessione JWT resta valida (non
  // esiste ancora un sessionVersion), quindi il client viene disconnesso e
  // deve rifare login + 2FA. Il cookie firmato evita che la vecchia prova
  // sopravviva al cambio credenziali.
  return clearAdmin2fa(
    NextResponse.json({ success: true, reauthRequired: true })
  );
}
