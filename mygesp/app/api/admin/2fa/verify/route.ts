import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OTP } from "otplib";

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

  const cleanCode = code.trim().toUpperCase();
  const normalizedInput = cleanCode.replace(/-/g, "");

  // 1. Verifichiamo se è un codice TOTP valido (6 cifre)
  const otp = new OTP({ strategy: "totp" });
  const result = await otp.verify({ token: cleanCode, secret: admin.totpSecret });

  if (result.valid) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { totpEnabled: true },
    });
    return NextResponse.json({ success: true });
  }

  // 2. Se il TOTP fallisce, verifichiamo se è un codice di backup valido
  const backupIndex = (admin.backupCodes || []).findIndex(
    (bCode) => bCode.replace(/-/g, "") === normalizedInput
  );

  if (backupIndex !== -1) {
    // Rimuoviamo il codice di backup usato per non farlo riutilizzare
    const updatedBackupCodes = admin.backupCodes.filter((_, idx) => idx !== backupIndex);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        totpEnabled: true,
        backupCodes: updatedBackupCodes,
      },
    });

    return NextResponse.json({
      success: true,
      usedBackupCode: true,
      remainingCodes: updatedBackupCodes.length,
    });
  }

  return NextResponse.json({ error: "Codice non valido" }, { status: 400 });
}