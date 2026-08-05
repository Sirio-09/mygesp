
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
  const admin = await prisma.admin.findUnique({
    where: { id: (session.user as { id: string }).id },
  });

  if (!admin?.totpSecret) {
    return NextResponse.json({ error: "2FA non configurato" }, { status: 400 });
  }

  const otp = new OTP({ strategy: "totp" });
  const result = await otp.verify({ token: code, secret: admin.totpSecret });

  if (!result.valid) {
    return NextResponse.json({ error: "Codice non valido" }, { status: 400 });
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { totpEnabled: true },
  });

  return NextResponse.json({ success: true });
}