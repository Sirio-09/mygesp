import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateBackupCodes } from "@/lib/backup-codes";
import { rateLimitResponse } from "@/lib/rate-limiter";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * Codici di recupero del 2FA dell'utente collegato.
 *
 * - `GET`  → stato sintetico (2FA attivo? quanti codici restano).
 * - `POST` → rigenera gli 8 codici e restituisce quelli in chiaro una sola
 *   volta. Il segreto TOTP non viene toccato: l'app authenticator continua a
 *   funzionare e non c'è rischio di restare fuori dall'account.
 */

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function GET() {
  const guard = await requireAdmin();

  if (!guard.ok) return guard.response;

  const admin = await prisma.admin.findUnique({
    where: { id: guard.adminId },
    select: { totpEnabled: true, backupCodes: true },
  });

  if (!admin) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  return NextResponse.json({
    totpEnabled: admin.totpEnabled,
    remainingCodes: admin.backupCodes.length,
  });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();

  if (!guard.ok) return guard.response;

  const adminId = guard.adminId;

  const limited = await rateLimitResponse(
    `2fa-backup-codes:${clientIp(req)}`,
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

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });

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

  const { plain, hashed } = generateBackupCodes(8);

  await prisma.admin.update({
    where: { id: admin.id },
    data: { backupCodes: hashed },
  });

  return NextResponse.json({ codes: plain });
}
