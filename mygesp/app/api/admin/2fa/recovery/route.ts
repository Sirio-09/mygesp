import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OTP } from "otplib";
import QRCode from "qrcode";
import { findBackupCodeIndex } from "@/lib/backup-codes";
import { encryptSecret } from "@/lib/secret-crypto";
import { requireAdmin } from "@/lib/admin-guard";
import { rateLimitResponse } from "@/lib/rate-limiter";
import { getClientIp } from "@/lib/request-ip";
import {
  checkAdmin2faLockout,
  recordFailed2faAttempt,
} from "@/lib/admin-2fa-lockout";

export async function POST(req: Request) {
  // Recupero d'emergenza: per definizione avviene senza prova 2FA attiva.
  const guard = await requireAdmin({ allowUnverified2fa: true });
  if (!guard.ok) return guard.response;

  const limited = await rateLimitResponse(
    `2fa-recovery:ip:${getClientIp(req)}`,
    15,
    15 * 60 * 1000
  );
  if (limited) return limited;

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
  const lockoutCheck = checkAdmin2faLockout(admin);
  if (lockoutCheck.locked) {
    return lockoutCheck.response;
  }

  const backupIndex = findBackupCodeIndex(admin.backupCodes ?? [], code);

  // 2. Se il codice di recupero è errato: incremento atomico tentativi e blocco
  if (backupIndex === -1) {
    return recordFailed2faAttempt(
      admin,
      lockoutCheck.priorAttempts,
      "Codice di recupero non valido o già utilizzato"
    );
  }

  // 3. Generiamo il NUOVO segreto TOTP e il relativo QR Code
  const updatedBackupCodes = admin.backupCodes.filter((_, idx) => idx !== backupIndex);
  const otp = new OTP({ strategy: "totp" });
  const newSecret = otp.generateSecret();
  const otpauthUrl = otp.generateURI({
    issuer: "MyGesp",
    label: admin.email || admin.username,
    secret: newSecret,
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  // 4. Consumo atomico del codice di recupero + reset tentativi
  const consumed = await prisma.admin.updateMany({
    where: {
      id: admin.id,
      backupCodes: { equals: admin.backupCodes },
      OR: [{ lockoutUntil: null }, { lockoutUntil: { lte: new Date() } }],
    },
    data: {
      totpSecret: encryptSecret(newSecret),
      totpEnabled: false,
      backupCodes: updatedBackupCodes,
      failed2faAttempts: 0,
      lockoutUntil: null,
    },
  });

  if (consumed.count === 0) {
    return NextResponse.json(
      { error: "Codice già utilizzato o account temporaneamente bloccato. Riprova." },
      { status: 409 }
    );
  }

  return NextResponse.json({
    success: true,
    qrCodeDataUrl,
    secret: newSecret,
  });
}
