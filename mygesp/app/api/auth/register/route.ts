import { prisma } from "@/lib/db";
import { resend } from "@/lib/resend";
import { hasValidMxRecords } from "@/lib/email-check";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password obbligatorie." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Controllo se il dominio email possiede record MX validi
    const isValidDomain = await hasValidMxRecords(cleanEmail);
    if (!isValidDomain) {
      return NextResponse.json(
        { error: "L'indirizzo email inserito non appartiene a un dominio valido." },
        { status: 400 }
      );
    }

    // 2. Controllo se l'email è già registrata
    const existing = await prisma.customer.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email già registrata." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crea il cliente non verificato
    const customer = await prisma.customer.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name ? name.trim() : null,
        isVerified: false,
      },
    });

    // 4. Genera il token di verifica (scadenza 24 ore)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { token, customerId: customer.id, expiresAt },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    // PERCORSO AGGIORNATO
    const verifyUrl = `${baseUrl}/account/verify-email?token=${token}`;

    // 5. Invio mail con Resend
    const { error: emailError } = await resend.emails.send({
      from: "MyGesp <onboarding@resend.dev>",
      to: cleanEmail,
      subject: "Conferma la tua email — MyGesp",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Benvenuto su MyGesp!</h2>
          <p>Conferma il tuo indirizzo email cliccando sul pulsante in basso:</p>
          <a href="${verifyUrl}" style="background-color: #2e7d32; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin: 12px 0;">
            Conferma Email
          </a>
        </div>
      `,
    });

    if (emailError) {
      console.error("Errore Resend:", emailError);
      return NextResponse.json(
        { error: `Errore nell'invio dell'email: ${emailError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Controlla la tua email per confermare l'account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Errore server registrazione:", error);
    return NextResponse.json(
      { error: "Errore durante la registrazione." },
      { status: 500 }
    );
  }
}