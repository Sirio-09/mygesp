import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  if (!(session.user as { isManager?: boolean })?.isManager) {
    return NextResponse.json({ error: "Solo il manager può creare nuovi utenti" }, { status: 403 });
  }

  const { username, email, password } = await req.json();

  if (!username || !email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Nome utente, email e password (min. 8 caratteri) sono obbligatori" },
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

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: { username, email, password: hashedPassword },
  });

  return NextResponse.json({ id: admin.id, email: admin.email });
}

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const admins = await prisma.admin.findMany({
    select: { id: true, username: true, email: true, totpEnabled: true, isManager: true },
  });

  return NextResponse.json(admins);
}