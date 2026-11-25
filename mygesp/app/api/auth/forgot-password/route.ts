import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import crypto from "crypto";
import { rateLimitResponse } from "@/lib/rate-limiter";
import { getSiteUrl } from "@/lib/stripe";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export async function POST(req: Request) {
  try {
    // Rate limiting per IP e per indirizzo: chiavi distinte da quelle di
    // registrazione e login, altrimenti i tre flussi si consumavano a vicenda
    // lo stesso contatore.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipLimit = await rateLimitResponse(
      `password-reset:ip:${ip}`,
      5,
      15 * 60 * 1000
    );
    if (ipLimit) return ipLimit;

    const { email } = await req.json();

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Inserisci un indirizzo email valido." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail.length > 254 || !EMAIL_PATTERN.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Inserisci un indirizzo email valido." },
        { status: 400 }
      );
    }

    const emailLimit = await rateLimitResponse(
      `password-reset:email:${cleanEmail}`,
      3,
      15 * 60 * 1000
    );
    if (emailLimit) return emailLimit;

    const customer = await prisma.customer.findUnique({
      where: { email: cleanEmail },
    });

    // Risposta generica positiva per prevenire l'enumerazione delle email
    if (!customer) {
      return NextResponse.json({ success: true });
    }

    // Cancella eventuali vecchi token generati precedentemente per questo utente
    await prisma.passwordResetToken.deleteMany({
      where: { customerId: customer.id },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minuti

    await prisma.passwordResetToken.create({
      data: { token, customerId: customer.id, expiresAt },
    });

    const resetUrl = `${getSiteUrl()}/account/reimposta-password?token=${token}`;

    await sendEmail({
      to: cleanEmail,
      subject: "Reimposta la tua password — MyGesp",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2>Reimposta la password</h2>
          <p>Hai richiesto di reimpostare la password del tuo account MyGesp.</p>
          <p>
            <a href="${resetUrl}" style="background-color: #2e7d32; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin: 12px 0;">
              Clicca qui per scegliere una nuova password
            </a>
          </p>
          <p style="color: #666; font-size: 13px;">Il link scade tra 30 minuti. Se non hai richiesto tu questa operazione, puoi ignorare questa email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Si è verificato un errore durante l'invio dell'email." },
      { status: 500 }
    );
  }
}