import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OTP } from "otplib";
import QRCode from "qrcode";
import { generateBackupCodes } from "@/lib/backup-codes";
import { encryptSecret, decryptSecret } from "@/lib/secret-crypto";

export async function POST() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (
    !session ||
    (session.user as { role?: string })?.role !== "admin" ||
    !userId
  ) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: userId },
    select: { totpEnabled: true, totpSecret: true },
  });

  if (!admin) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  // Se il 2FA è già attivo questo endpoint sarebbe una "reimpostazione":
  // sovrascriverebbe il secret senza chiedere la password, invalidando l'app
  // dell'utente e i suoi codici di recupero (lockout immediato). La
  // reimpostazione voluta passa da /api/admin/2fa/regenerate (protetta da password).
  if (admin.totpEnabled) {
    return NextResponse.json(
      { error: "2FA già attivo: usa la reimpostazione dall'area Account." },
      { status: 409 }
    );
  }

  const otp = new OTP({ strategy: "totp" });
  const issuer = "MyGesp";
  const label = session.user?.email ?? "admin";

  // Setup idempotente: se esiste già un secret non ancora attivato lo riusiamo.
  // Rigenerarlo a ogni POST è pericoloso: un reload della pagina cambierebbe il
  // secret sotto gli occhi dell'utente e il QR già scansionato non produrrebbe
  // più codici validi (l'utente resterebbe fuori dall'account).
  if (admin.totpSecret) {
    try {
      const existingSecret = decryptSecret(admin.totpSecret);
      const otpauthUrl = otp.generateURI({ issuer, label, secret: existingSecret });
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

      // I codici in chiaro non sono più recuperabili (in DB ci sono gli hash):
      // restano validi quelli già consegnati all'utente.
      return NextResponse.json({
        qrCodeDataUrl,
        secret: existingSecret,
        backupCodes: null,
        reused: true,
      });
    } catch {
      // Secret illeggibile (chiave di cifratura ruotata): si rigenera da zero.
    }
  }

  const secret = otp.generateSecret();
  const otpauthUrl = otp.generateURI({ issuer, label, secret });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  // Generiamo 8 codici di backup: nel DB salviamo solo l'hash.
  const { plain, hashed } = generateBackupCodes(8);

  await prisma.admin.update({
    where: { id: userId },
    data: {
      totpSecret: encryptSecret(secret),
      backupCodes: hashed,
    },
  });

  // I codici in chiaro vengono mostrati una sola volta all'utente.
  return NextResponse.json({
    qrCodeDataUrl,
    secret,
    backupCodes: plain,
    reused: false,
  });
}