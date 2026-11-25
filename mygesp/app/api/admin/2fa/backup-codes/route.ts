import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateBackupCodes } from "@/lib/backup-codes";
import { rateLimitResponse } from "@/lib/rate-limiter";

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

async function sessionAdminId(): Promise<string | null> {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!session || user?.role !== "admin" || !user.id) return null;

  return user.id;
}

export async function GET() {
  const adminId = await sessionAdminId();

  if (!adminId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
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
  const adminId = await sessionAdminId();

  if (!adminId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

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
