import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

  return NextResponse.json({
    id: admin.id,
    username: admin.username,
    email: admin.email,
    tempPassword, // Restituiamo la password in chiaro per mostrarla a schermo al Manager
  });
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