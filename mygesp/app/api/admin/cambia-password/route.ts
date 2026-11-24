import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { rateLimitResponse } from "@/lib/rate-limiter";

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  const role = (session?.user as { role?: string })?.role;

  if (!session || role !== "admin" || !userId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  // Difesa in profondità: limita i tentativi di indovinare la password attuale.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = await rateLimitResponse(
    `password-change:${ip}`,
    10,
    15 * 60 * 1000
  );
  if (limited) return limited;

  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword) {
    return NextResponse.json(
      { error: "Inserisci la password attuale" },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "La password deve contenere almeno 8 caratteri" },
      { status: 400 }
    );
  }

  const admin = await prisma.admin.findUnique({ where: { id: userId } });

  if (!admin) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  const validCurrent = await bcrypt.compare(currentPassword, admin.password);

  if (!validCurrent) {
    return NextResponse.json(
      { error: "La password attuale non è corretta" },
      { status: 400 }
    );
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "La nuova password deve essere diversa da quella attuale" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.admin.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      mustChangePassword: false,
    },
  });

  return NextResponse.json({ success: true });
}