import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OTP } from "otplib";
import QRCode from "qrcode";
import { findBackupCodeIndex } from "@/lib/backup-codes";
import { encryptSecret } from "@/lib/secret-crypto";
import { requireAdmin } from "@/lib/admin-guard";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req: Request) {
  // Recupero d'emergenza: per definizione avviene senza prova 2FA attiva.
  const guard = await requireAdmin({ allowUnverified2fa: true });
  if (!guard.ok) return guard.response;

  let code: unknown;

  try {
    const body = (await req.json()) as { code?: unknown };
    code = body?.code;
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  if (!code || typeof code !== "string" || code.length > 40) {
    return NextResponse.json({ error: "Codice mancante" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: guard.adminId },
  });

  if (!admin) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  // 1. Blocco temporaneo attivo: nessun codice viene valutato.
  const lockoutUntil = admin.lockoutUntil;
  const now = Date.now();

  if (lockoutUntil && lockoutUntil.getTime() > now) {
    const minutesLeft = Math.ceil((lockoutUntil.getTime() - now) / (1000 * 60));
    return NextResponse.json(
      {
        error: `Troppi tentativi falliti. Riprova tra ${minutesLeft} minut${minutesLeft === 1 ? "o" : "i"}.`,
        lockedUntil: lockoutUntil.toISOString(),
      },
      { status: 429 }
    );
  }

  // Blocco scaduto: la finestra di tentativi riparte da zero, altrimenti il
  // primo codice errato ri-bloccherebbe subito l'account per altri 15 minuti.
  if (lockoutUntil) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { failed2faAttempts: 0, lockoutUntil: null },
    });
  }

  const priorAttempts = lockoutUntil ? 0 : admin.failed2faAttempts || 0;

  const backupIndex = findBackupCodeIndex(admin.backupCodes ?? [], code);

  // 2. Se il codice di recupero è errato: incremento tentativi e blocco
  if (backupIndex === -1) {
    const newAttempts = priorAttempts + 1;
    const shouldLock = newAttempts >= MAX_ATTEMPTS;
    const lockoutTime = shouldLock
      ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
      : null;

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        failed2faAttempts: newAttempts,
        lockoutUntil: lockoutTime,
      },
    });

    if (shouldLock) {
      return NextResponse.json(
        {
          error: `Account bloccato per troppi tentativi errati. Riprova tra ${LOCKOUT_MINUTES} minuti.`,
          lockedUntil: lockoutTime ? lockoutTime.toISOString() : null,
        },
        { status: 429 }
      );
    }

    const remainingAttempts = MAX_ATTEMPTS - newAttempts;
    return NextResponse.json(
      { error: `Codice di recupero non valido o già utilizzato. Tentativi rimasti: ${remainingAttempts}` },
      { status: 400 }
    );
  }

  // 3. Codice valido: rimuoviamo il codice usato dall'array
  const updatedBackupCodes = admin.backupCodes.filter((_, idx) => idx !== backupIndex);

  // 4. Generiamo il NUOVO segreto TOTP e il relativo QR Code
  const otp = new OTP({ strategy: "totp" });
  const newSecret = otp.generateSecret();
  const otpauthUrl = otp.generateURI({
    issuer: "MyGesp",
    label: admin.email || admin.username,
    secret: newSecret,
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  // 5. Aggiorniamo il DB e AZZERIAMO sia i tentativi che il blocco
  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      totpSecret: encryptSecret(newSecret),
      totpEnabled: false,
      backupCodes: updatedBackupCodes,
      failed2faAttempts: 0,
      lockoutUntil: null,
    },
  });

  return NextResponse.json({
    success: true,
    qrCodeDataUrl,
    secret: newSecret,
  });
}