import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OTP } from "otplib";
import QRCode from "qrcode";

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

  // sovrascrive il vecchio segreto: il vecchio QR/app smette di generare codici validi
  await prisma.admin.update({
    where: { id: (session.user as { id: string }).id },
    data: { totpSecret: secret },
  });

  return NextResponse.json({ qrCodeDataUrl });
}