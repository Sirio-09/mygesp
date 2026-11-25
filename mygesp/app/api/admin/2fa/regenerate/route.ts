import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { OTP } from "otplib";
import QRCode from "qrcode";
import { generateBackupCodes } from "@/lib/backup-codes";
import { rateLimitResponse } from "@/lib/rate-limiter";
import { encryptSecret } from "@/lib/secret-crypto";

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (
    !session ||
    (session.user as { role?: string })?.role !== "admin" ||
    !userId
  ) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  // Rigenerare il 2FA azzera il fattore attivo: senza la password attuale
  // basterebbe una sessione rubata per prendere il controllo dell'account.
  const limited = await rateLimitResponse(
    `2fa-regenerate:${clientIp(req)}`,
    10,
    15 * 60 * 1000
  );
  if (limited) return limited;

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";

  if (!password) {
    return NextResponse.json(
      { error: "Inserisci la password attuale" },
      { status: 400 }
    );
  }

  const admin = await prisma.admin.findUnique({ where: { id: userId } });

  if (!admin) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  const validPassword = await bcrypt.compare(password, admin.password);

  if (!validPassword) {
    return NextResponse.json(
      { error: "La password attuale non è corretta" },
      { status: 400 }
    );
  }

  const otp = new OTP({ strategy: "totp" });
  const secret = otp.generateSecret();
  const otpauthUrl = otp.generateURI({
    issuer: "MyGesp",
    label: admin.email ?? "admin",
    secret,
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  // Rigenera anche i codici di backup e forza una nuova verifica: altrimenti
  // il vecchio app resterebbe "attivo" con un segreto ormai non più valido,
  // bloccando l'utente fuori dall'account.
  const { plain, hashed } = generateBackupCodes(8);

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      totpSecret: encryptSecret(secret),
      totpEnabled: false,
      backupCodes: hashed,
      failed2faAttempts: 0,
      lockoutUntil: null,
    },
  });

  return NextResponse.json({ qrCodeDataUrl, secret, backupCodes: plain });
}
