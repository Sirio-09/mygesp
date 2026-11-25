import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/resend";
import { hasValidMxRecords } from "@/lib/email-check";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { rateLimitResponse } from "@/lib/rate-limiter";
import { getSiteUrl } from "@/lib/stripe";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MAX_PASSWORD_LENGTH = 72;

/** Email già iscritta alla newsletter: la violazione dell'unique non è un errore. */
function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function POST(req: Request) {
  try {
    // Rate limiting: 3 registrazioni per 15 minuti per IP. Il prefisso evita di
    // condividere il contatore con gli altri endpoint pubblici (prima
    // registrazione e recupero password usavano la stessa chiave `ip`).
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitRes = await rateLimitResponse(
      `register:ip:${ip}`,
      3,
      15 * 60 * 1000
    );
    if (rateLimitRes) return rateLimitRes;

    const { email, password, name, acceptTerms, subscribeNewsletter } =
      await req.json();

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email e password obbligatorie." },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: "La password deve contenere da 8 a 72 caratteri." },
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

    if (cleanEmail.length > 254 || !EMAIL_PATTERN.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Inserisci un indirizzo email valido." },
        { status: 400 }
      );
    }

    const cleanName =
      name ? String(name).trim().slice(0, 80) || null : null;

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
        name: cleanName,
        isVerified: false,
      },
    });

    const baseUrl = getSiteUrl();

    // 5. Iscrizione alla Newsletter: scrittura diretta sul modello (niente
    // chiamata HTTP verso se stessi, che su Vercel dipende dall'URL pubblico).
    if (subscribeNewsletter) {
      try {
        await prisma.newsletter.create({ data: { email: cleanEmail } });
      } catch (err) {
        if (!isUniqueConstraintError(err)) {
          console.error("Errore salvataggio newsletter:", err);
        }
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
    const emailResult = await sendEmail({
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

    if (!emailResult.ok) {
      console.error("Errore Resend:", emailResult.error);
      // L'account è stato creato: non fallire l'intera registrazione per un'email
      // L'utente potrà richiedere un nuovo link di verifica dal login.
      return NextResponse.json(
        {
          success: true,
          message: "Account creato. Non è stato possibile inviare l'email di verifica; richiedi un nuovo link dal login.",
        },
        { status: 201 }
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