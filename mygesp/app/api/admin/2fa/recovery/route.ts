import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OTP } from "otplib";
import QRCode from "qrcode";

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

  if (!admin) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  // 1. Controllo se l'account è temporaneamente bloccato
  if (admin.lockoutUntil && admin.lockoutUntil > new Date()) {
    const minutesLeft = Math.ceil((admin.lockoutUntil.getTime() - Date.now()) / (1000 * 60));
    return NextResponse.json(
      { error: `Troppi tentativi falliti. Riprova tra ${minutesLeft} minut${minutesLeft === 1 ? 'o' : 'i'}.` },
      { status: 429 }
    );
  }

  const normalizedInput = code.trim().toUpperCase().replace(/-/g, "");

  const backupIndex = (admin.backupCodes || []).findIndex(
    (bCode) => bCode.replace(/-/g, "") === normalizedInput
  );

  // 2. Se il codice di recupero è errato: incremento tentativi e blocco
  if (backupIndex === -1) {
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
    label: session.user?.email ?? "admin",
    secret: newSecret,
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  // 5. Aggiorniamo il DB e AZZERIAMO sia i tentativi che il blocco
  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      totpSecret: newSecret,
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