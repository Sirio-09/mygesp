import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Inserisci un indirizzo email valido." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL;
    const resetUrl = `${baseUrl}/account/reimposta-password?token=${token}`;

    await resend.emails.send({
      from: "MyGesp <onboarding@resend.dev>",
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