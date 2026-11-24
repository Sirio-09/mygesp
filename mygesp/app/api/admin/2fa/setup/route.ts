import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OTP } from "otplib";
import QRCode from "qrcode";
import { generateBackupCodes } from "@/lib/backup-codes";
import { encryptSecret } from "@/lib/secret-crypto";

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

  // Generiamo 8 codici di backup: nel DB salviamo solo l'hash.
  const { plain, hashed } = generateBackupCodes(8);

  await prisma.admin.update({
    where: { id: (session.user as { id: string }).id },
    data: {
      totpSecret: encryptSecret(secret),
      backupCodes: hashed,
    },
  });

  // I codici in chiaro vengono mostrati una sola volta all'utente.
  return NextResponse.json({ qrCodeDataUrl, secret, backupCodes: plain });
}