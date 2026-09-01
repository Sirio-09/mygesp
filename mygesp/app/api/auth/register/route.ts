import { prisma } from "@/lib/db";
import { resend } from "@/lib/resend";
import { hasValidMxRecords } from "@/lib/email-check";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, name, acceptTerms, subscribeNewsletter } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password obbligatorie." },
        { status: 400 }
      );
    }

    // 1. Convalida accettazione Termini e Privacy Policy
    if (!acceptTerms) {
      return NextResponse.json(
        { error: "È necessario accettare i Termini e la Privacy Policy." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Controllo validità dominio e record MX
    const isValidDomain = await hasValidMxRecords(cleanEmail);
    if (!isValidDomain) {
      return NextResponse.json(
        { error: "L'indirizzo email inserito non appartiene a un dominio valido." },
        { status: 400 }
      );
    }

    // 3. Controllo duplicati clienti
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

    // 4. Creazione cliente non verificato
    const customer = await prisma.customer.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name ? name.trim() : null,
        isVerified: false,
      },
    });

    const envUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const baseUrl = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;

    // 5. Gestione iscrizione alla Newsletter (invoca l'endpoint dedicato senza dipendere dal modello Prisma)
    if (subscribeNewsletter) {
      try {
        await fetch(`${baseUrl}/api/newsletter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail }),
        });
      } catch (err) {
        console.error("Errore salvataggio newsletter:", err);
      }
    }

    // 6. Generazione token di verifica (valido 24 ore)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { token, customerId: customer.id, expiresAt },
    });

    const verifyUrl = `${baseUrl}/account/verify-email?token=${token}`;

    // 7. Invio email stilizzata tramite Resend
    const { error: emailError } = await resend.emails.send({
      from: "MyGesp <onboarding@resend.dev>",
      to: cleanEmail,
      subject: "Conferma la tua email — MyGesp",
      html: `
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Conferma Email</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f7f7f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f7f5; padding: 40px 10px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
                  
                  <!-- Brand Header -->
                  <tr>
                    <td style="padding: 32px 32px 0 32px; text-align: center;">
                      <span style="font-size: 24px; font-weight: 900; text-transform: uppercase; color: #1a1a1a; letter-spacing: 1.5px;">MYGESP</span>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #1a1a1a; text-transform: uppercase; text-align: center;">
                        Verifica il tuo account
                      </h1>
                      <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #555555; text-align: center;">
                        Grazie per esserti registrato su <strong>MyGesp</strong>! Clicca sul pulsante qui sotto per confermare la tua email e attivare il profilo.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                        <tr>
                          <td align="center">
                            <a href="${verifyUrl}" target="_blank" style="display: inline-block; background-color: #2e7d32; color: #ffffff; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; padding: 14px 28px; border-radius: 6px; box-shadow: 0 3px 6px rgba(46, 125, 50, 0.2);">
                              Conferma Email
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Fallback Link -->
                      <div style="border-top: 1px solid #f0f0f0; padding-top: 20px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #888888; text-align: center;">
                          Se il pulsante non funziona, copia e incolla questo link nel browser:
                        </p>
                        <p style="margin: 0; font-size: 11px; word-break: break-all; text-align: center;">
                          <a href="${verifyUrl}" style="color: #2e7d32; text-decoration: underline;">${verifyUrl}</a>
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #fafafa; padding: 20px 32px; border-top: 1px solid #f0f0f0; text-align: center;">
                      <p style="margin: 0; font-size: 11px; color: #999999; line-height: 1.5;">
                        Se non hai richiesto tu la creazione di questo account, puoi ignorare questa email.<br>
                        &copy; ${new Date().getFullYear()} MyGesp. Tutti i diritti riservati.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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