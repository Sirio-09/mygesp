import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OTP } from "otplib";
import QRCode from "qrcode";

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

  const normalizedInput = code.trim().toUpperCase().replace(/-/g, "");

  const backupIndex = (admin.backupCodes || []).findIndex(
    (bCode) => bCode.replace(/-/g, "") === normalizedInput
  );

  if (backupIndex === -1) {
    return NextResponse.json(
      { error: "Codice di recupero non valido o già utilizzato" },
      { status: 400 }
    );
  }

  // 1. Rimuoviamo il codice di recupero usato
  const updatedBackupCodes = admin.backupCodes.filter((_, idx) => idx !== backupIndex);

  // 2. Generiamo il NUOVO segreto TOTP e il relativo QR Code
  const otp = new OTP({ strategy: "totp" });
  const newSecret = otp.generateSecret();
  const otpauthUrl = otp.generateURI({
    issuer: "MyGesp",
    label: session.user?.email ?? "admin",
    secret: newSecret,
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  // 3. Aggiorniamo l'admin: nuovo secret e reset totpEnabled a false
  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      totpSecret: newSecret,
      totpEnabled: false,
      backupCodes: updatedBackupCodes,
    },
  });

  return NextResponse.json({
    success: true,
    qrCodeDataUrl,
    secret: newSecret,
  });
}