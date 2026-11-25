import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { rateLimitResponse } from "@/lib/rate-limiter";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = await rateLimitResponse(`newsletter:ip:${ip}`, 5, 15 * 60 * 1000);
  if (limited) return limited;

  let email: unknown;

  try {
    const body = (await req.json()) as { email?: unknown };
    email = body?.email;
  } catch {
    return NextResponse.json({ error: "Payload JSON non valido" }, { status: 400 });
  }

  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (cleanEmail.length > 254 || !EMAIL_PATTERN.test(cleanEmail)) {
    return NextResponse.json({ error: "Email non valida" }, { status: 400 });
  }

  try {
    await prisma.newsletter.create({ data: { email: cleanEmail } });
    return NextResponse.json({ success: true });
  } catch (err) {
    // email già iscritta (constraint univoca): non è un errore da mostrare all'utente
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ success: true });
    }
    console.error("Errore iscrizione newsletter:", err);
    return NextResponse.json(
      { error: "Errore durante l'iscrizione alla newsletter." },
      { status: 500 }
    );
  }
}