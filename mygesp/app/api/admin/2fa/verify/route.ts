import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OTP } from "otplib";
import { findBackupCodeIndex } from "@/lib/backup-codes";
import { decryptSecret, encryptSecret, isEncryptedSecret } from "@/lib/secret-crypto";
import { grantAdmin2fa, requireAdmin } from "@/lib/admin-guard";
import { rateLimitResponse } from "@/lib/rate-limiter";
import { getClientIp } from "@/lib/request-ip";
import {
  checkAdmin2faLockout,
  recordFailed2faAttempt,
} from "@/lib/admin-2fa-lockout";

export async function POST(req: Request) {
  // Endpoint di bootstrap: la verifica 2FA non è ancora stata fatta, quindi è
  // l'unico (insieme a setup/recovery) che può girare senza prova 2FA.
  const guard = await requireAdmin({ allowUnverified2fa: true });
  if (!guard.ok) return guard.response;

  const limited = await rateLimitResponse(
    `2fa-verify:ip:${getClientIp(req)}`,
    20,
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

  if (!guard.sessionId) {
    return NextResponse.json(
      { error: "Sessione non valida: accedi di nuovo." },
      { status: 401 }
    );
  }

  const admin = await prisma.admin.findUnique({
    where: { id: guard.adminId },
  });

  if (!admin?.totpSecret) {
    return NextResponse.json({ error: "2FA non configurato" }, { status: 400 });
  }

  // 1. Blocco temporaneo attivo: nessun codice viene valutato, nemmeno quello
  //    corretto (protezione anti brute-force).
  const lockoutCheck = checkAdmin2faLockout(admin);
  if (lockoutCheck.locked) {
    return lockoutCheck.response;
  }

  const cleanCode = code.trim().toUpperCase();

  // 2. Decifriamo il segreto TOTP salvato a riposo (compatibile con i vecchi valori in chiaro).
  let totpSecret: string;
  try {
    totpSecret = decryptSecret(admin.totpSecret);
  } catch {
    return NextResponse.json(
      { error: "Impossibile leggere il segreto 2FA. Contatta l'amministratore." },
      { status: 500 }
    );
  }

  // 3. Verifica del codice TOTP (6 cifre)
  //    Tolleranza solo verso il passato: accettiamo la finestra precedente ma
  //    non quella futura.
  const otp = new OTP({ strategy: "totp" });
  const result = await otp.verify({
    token: cleanCode,
    secret: totpSecret,
    epochTolerance: [30, 0],
  });

  if (result.valid) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        totpEnabled: true,
        failed2faAttempts: 0,
        lockoutUntil: null,
        ...(isEncryptedSecret(admin.totpSecret)
          ? {}
          : { totpSecret: encryptSecret(totpSecret) }),
      },
    });

    return grantAdmin2fa(
      NextResponse.json({ success: true }),
      admin.id,
      guard.sessionId
    );
  }

  // 4. Se il TOTP fallisce, verifica se è un codice di backup valido (consumo atomico)
  const backupIndex = findBackupCodeIndex(admin.backupCodes ?? [], cleanCode);

  if (backupIndex !== -1) {
    const updatedBackupCodes = admin.backupCodes.filter((_, idx) => idx !== backupIndex);

    const consumed = await prisma.admin.updateMany({
      where: {
        id: admin.id,
        backupCodes: { equals: admin.backupCodes },
        OR: [{ lockoutUntil: null }, { lockoutUntil: { lte: new Date() } }],
      },
      data: {
        totpEnabled: true,
        backupCodes: updatedBackupCodes,
        failed2faAttempts: 0,
        lockoutUntil: null,
        ...(isEncryptedSecret(admin.totpSecret)
          ? {}
          : { totpSecret: encryptSecret(totpSecret) }),
      },
    });

    if (consumed.count === 0) {
      return NextResponse.json(
        { error: "Richiesta concorrente o account bloccato. Riprova." },
        { status: 409 }
      );
    }

    return grantAdmin2fa(
      NextResponse.json({
        success: true,
        usedBackupCode: true,
        remainingCodes: updatedBackupCodes.length,
      }),
      admin.id,
      guard.sessionId
    );
  }

  // 5. Gestione tentativi errati e blocco temporaneo (atomica)
  return recordFailed2faAttempt(admin, lockoutCheck.priorAttempts, "Codice non valido");
}
