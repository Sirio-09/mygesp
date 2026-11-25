import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/resend";
import { requireAdmin } from "@/lib/admin-guard";
import { escapeHtml } from "@/lib/escape-html";

const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export async function POST(req: Request) {
  const guard = await requireAdmin({ requireManager: true });
  if (!guard.ok) return guard.response;

  let body: { username?: unknown; email?: unknown };

  try {
    body = (await req.json()) as { username?: unknown; email?: unknown };
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const username =
    typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!USERNAME_PATTERN.test(username)) {
    return NextResponse.json(
      {
        error:
          "Nome utente non valido: 3-32 caratteri tra lettere, numeri, punto, trattino e underscore.",
      },
      { status: 400 }
    );
  }

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Email non valida" }, { status: 400 });
  }

  const [existingUsername, existingEmail] = await Promise.all([
    prisma.admin.findUnique({ where: { username } }),
    prisma.admin.findUnique({ where: { email } }),
  ]);

  if (existingUsername) {
    return NextResponse.json({ error: "Nome utente già in uso" }, { status: 400 });
  }

  if (existingEmail) {
    return NextResponse.json(
      { error: "Email già registrata come admin" },
      { status: 400 }
    );
  }

  // Password temporanea robusta: 12 byte casuali (96 bit) in base64url.
  const tempPassword = crypto.randomBytes(12).toString("base64url");
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  let admin;

  try {
    admin = await prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword,
        mustChangePassword: true,
      },
    });
  } catch (err) {
    // Race condition fra il controllo duplicati e l'INSERT.
    console.error("Errore creazione admin:", err);
    return NextResponse.json(
      { error: "Impossibile creare l'utente: riprova." },
      { status: 500 }
    );
  }

  // La password temporanea viene inviata via email all'indirizzo dell'utente.
  const emailResult = await sendEmail({
    to: admin.email,
    subject: "Credenziali di accesso MyGesp",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6;">
        <h2>Benvenuto nello staff MyGesp</h2>
        <p>È stato creato un account amministratore per te.</p>
        <ul>
          <li><strong>Nome utente:</strong> ${escapeHtml(admin.username)}</li>
          <li><strong>Password temporanea:</strong> <code style="font-size: 16px;">${escapeHtml(tempPassword)}</code></li>
        </ul>
        <p>Al primo accesso ti verrà richiesto di scegliere una nuova password e di configurare la verifica in due passaggi.</p>
        <p style="color: #666; font-size: 13px;">Se non ti aspettavi questa email, contatta il responsabile del negozio.</p>
      </div>
    `,
  });

  if (emailResult.ok) {
    return NextResponse.json(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        emailSent: true,
        message:
          "Utente creato. La password temporanea è stata inviata all'indirizzo email indicato.",
      },
      { status: 201 }
    );
  }

  // Fallback: se Resend non è configurato l'account resterebbe inaccessibile,
  // quindi restituiamo la password al Manager (unico autorizzato a questa API).
  return NextResponse.json(
    {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      emailSent: false,
      tempPassword,
      message:
        "Utente creato, ma l'email con la password non è stata inviata (RESEND_API_KEY non configurata). Comunica tu la password temporanea.",
    },
    { status: 201 }
  );
}

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        totpEnabled: true,
        isManager: true,
        mustChangePassword: true,
      },
      orderBy: { username: "asc" },
    });

    return NextResponse.json(admins);
  } catch (err) {
    console.error("Errore recupero utenti admin:", err);
    return NextResponse.json(
      { error: "Errore durante il recupero degli utenti" },
      { status: 500 }
    );
  }
}