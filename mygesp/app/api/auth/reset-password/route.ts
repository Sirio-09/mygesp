import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { rateLimitResponse } from "@/lib/rate-limiter";

const MAX_PASSWORD_LENGTH = 72;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limited = await rateLimitResponse(
      `password-reset:confirm:${ip}`,
      10,
      15 * 60 * 1000
    );
    if (limited) return limited;

    const { token, password } = await req.json();

    if (typeof token !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Token o password mancanti." },
        { status: 400 }
      );
    }

    if (token.length > 200) {
      return NextResponse.json(
        { error: "Link non valido o scaduto." },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: "La password deve contenere da 8 a 72 caratteri." },
        { status: 400 }
      );
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Link non valido o scaduto." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.customer.update({
        where: { id: resetToken.customerId },
        data: { password: hashedPassword },
      }),
      // Invalidiamo TUTTI i token di reset dell'utente, non solo quello usato:
      // eventuali link generati in parallelo resterebbero altrimenti validi.
      prisma.passwordResetToken.deleteMany({
        where: { customerId: resetToken.customerId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento della password." },
      { status: 500 }
    );
  }
}