import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OTP } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";

// Funzione helper per generare codici di backup casuali (es. A1B2-C3D4)
function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }
  return codes;
}

export async function POST() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const otp = new OTP({ strategy: "totp" });
  const secret = otp.generateSecret();
  const otpauthUrl = otp.generateURI({
    issuer: "MyGesp",
    label: session.user?.email ?? "admin",
    secret,
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  // Generiamo 8 codici di backup
  const backupCodes = generateBackupCodes(8);

  await prisma.admin.update({
    where: { id: (session.user as { id: string }).id },
    data: { 
      totpSecret: secret,
      backupCodes: backupCodes,
    },
  });

  return NextResponse.json({ qrCodeDataUrl, secret, backupCodes });
}