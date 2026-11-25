import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/resend";
import { rateLimitResponse } from "@/lib/rate-limiter";
import { getSiteUrl } from "@/lib/baseUrl";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export async function GET(req: NextRequest) {
  // 1. Usa req.nextUrl che gestisce in automatico l'URL senza far fallire il build
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/account/login?error=token-mancante", req.nextUrl)
    );
  }

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.redirect(
        new URL("/account/login?error=token-scaduto", req.nextUrl)
      );
    }

    // 2. Marca l'utente come verificato nel database
    await prisma.customer.update({
      where: { id: record.customerId },
      data: { isVerified: true },
    });

    // 3. Elimina il token per prevenirne il riutilizzo
    await prisma.verificationToken.delete({
      where: { id: record.id },
    });

    // 4. Reindirizza alla pagina di login in modo sicuro
    return NextResponse.redirect(
      new URL("/account/login?verified=true", req.nextUrl)
    );
  } catch (error) {
    console.error("Errore verifica email:", error);
    return NextResponse.redirect(
      new URL("/account/login?error=server-error", req.nextUrl)
    );
  }
}

/**
 * Reinvia l'email di conferma.
 *
 * Prima non esisteva: chi non riceveva il link (o lo lasciava scadere) restava
 * bloccato per sempre, perché il login rifiuta gli account non verificati.
 *
 * La risposta è sempre positiva per non permettere l'enumerazione degli
 * indirizzi registrati.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = await rateLimitResponse(
    `verify-email:ip:${ip}`,
    5,
    15 * 60 * 1000
  );
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
    const customer = await prisma.customer.findUnique({
      where: { email: cleanEmail },
    });

    // Già verificato o inesistente: stessa risposta, nessun indizio.
    if (!customer || customer.isVerified) {
      return NextResponse.json({ success: true, emailSent: false });
    }

    // Un solo token valido per volta.
    await prisma.verificationToken.deleteMany({
      where: { customerId: customer.id },
    });

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.verificationToken.create({
      data: {
        token,
        customerId: customer.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const verifyUrl = `${getSiteUrl()}/account/verify-email?token=${token}`;

    const result = await sendEmail({
      to: cleanEmail,
      subject: "Conferma la tua email — MyGesp",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6;">
          <h2>Conferma il tuo account</h2>
          <p>Clicca sul pulsante qui sotto per attivare il tuo account MyGesp. Il link scade tra 24 ore.</p>
          <p style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background-color: #2e7d32; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Conferma Email</a>
          </p>
          <p style="color: #666; font-size: 13px; word-break: break-all;">${verifyUrl}</p>
          <p style="color: #666; font-size: 13px;">Se non hai richiesto tu la creazione di questo account, ignora questa email.</p>
        </div>
      `,
    });

    if (!result.ok) {
      console.error("Errore invio email di verifica:", result.error);
      return NextResponse.json(
        {
          error:
            "Non è stato possibile inviare l'email di conferma. Riprova tra qualche minuto.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error("Errore reinvio verifica email:", error);
    return NextResponse.json(
      { error: "Errore durante l'invio dell'email di conferma." },
      { status: 500 }
    );
  }
}