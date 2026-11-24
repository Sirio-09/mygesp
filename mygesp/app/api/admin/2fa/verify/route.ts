import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OTP } from "otplib";
import { findBackupCodeIndex } from "@/lib/backup-codes";
import { decryptSecret, encryptSecret, isEncryptedSecret } from "@/lib/secret-crypto";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Codice mancante" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: (session.user as { id: string }).id },
  });

  if (!admin?.totpSecret) {
    return NextResponse.json({ error: "2FA non configurato" }, { status: 400 });
  }

  // 1. Controllo se l'account è temporaneamente bloccato
  if (admin.lockoutUntil && admin.lockoutUntil > new Date()) {
    const minutesLeft = Math.ceil((admin.lockoutUntil.getTime() - Date.now()) / (1000 * 60));
    return NextResponse.json(
      { error: `Troppi tentativi falliti. Riprova tra ${minutesLeft} minut${minutesLeft === 1 ? 'o' : 'i'}.` },
      { status: 429 }
    );
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
  const otp = new OTP({ strategy: "totp" });
  const result = await otp.verify({ token: cleanCode, secret: totpSecret });

  if (result.valid) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        totpEnabled: true,
        failed2faAttempts: 0,
        lockoutUntil: null,
        // Migrazione trasparente: al primo accesso utile cifriamo i vecchi segreti in chiaro.
        ...(isEncryptedSecret(admin.totpSecret)
          ? {}
          : { totpSecret: encryptSecret(totpSecret) }),
      },
    });
    return NextResponse.json({ success: true });
  }

  // 4. Se il TOTP fallisce, verifica se è un codice di backup valido
  const backupIndex = findBackupCodeIndex(admin.backupCodes ?? [], cleanCode);

  if (backupIndex !== -1) {
    const updatedBackupCodes = admin.backupCodes.filter((_, idx) => idx !== backupIndex);

    await prisma.admin.update({
      where: { id: admin.id },
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

    return NextResponse.json({
      success: true,
      usedBackupCode: true,
      remainingCodes: updatedBackupCodes.length,
    });
  }

  // 5. Gestione tentativi errati e blocco temporaneo
  const newAttempts = (admin.failed2faAttempts || 0) + 1;
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
      { error: `Account bloccato per troppi tentativi errati. Riprova tra ${LOCKOUT_MINUTES} minuti.` },
      { status: 429 }
    );
  }

  const remainingAttempts = MAX_ATTEMPTS - newAttempts;
  return NextResponse.json(
    { error: `Codice non valido. Tentativi rimasti: ${remainingAttempts}` },
    { status: 400 }
  );
}