import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/resend";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  if (!(session.user as { isManager?: boolean })?.isManager) {
    return NextResponse.json({ error: "Solo il manager può creare nuovi utenti" }, { status: 403 });
  }

  const { username, email } = await req.json();

  if (!username || !email) {
    return NextResponse.json(
      { error: "Nome utente ed email sono obbligatori" },
      { status: 400 }
    );
  }

  const existingUsername = await prisma.admin.findUnique({ where: { username } });
  if (existingUsername) {
    return NextResponse.json({ error: "Nome utente già in uso" }, { status: 400 });
  }

  const existingEmail = await prisma.admin.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ error: "Email già registrata come admin" }, { status: 400 });
  }

  // Genera password casuale di 10 caratteri
  const tempPassword = crypto.randomBytes(5).toString("hex");
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const admin = await prisma.admin.create({
    data: {
      username,
      email,
      password: hashedPassword,
      mustChangePassword: true,
    },
  });

  // La password temporanea viene inviata via email all'indirizzo dell'utente.
  const emailResult = await sendEmail({
    to: admin.email,
    subject: "Credenziali di accesso MyGesp",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6;">
        <h2>Benvenuto nello staff MyGesp</h2>
        <p>È stato creato un account amministratore per te.</p>
        <ul>
          <li><strong>Nome utente:</strong> ${admin.username}</li>
          <li><strong>Password temporanea:</strong> <code style="font-size: 16px;">${tempPassword}</code></li>
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
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      totpEnabled: true,
      isManager: true,
      mustChangePassword: true,
    },
  });

  return NextResponse.json(admins);
}