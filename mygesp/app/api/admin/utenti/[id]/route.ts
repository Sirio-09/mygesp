import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  if (!(session.user as { isManager?: boolean })?.isManager) {
    return NextResponse.json({ error: "Solo il manager può modificare altri utenti" }, { status: 403 });
  }

  const { id } = await params;
  const { password } = await req.json();

  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password di almeno 8 caratteri richiesta" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.admin.update({
    where: { id },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  if (!(session.user as { isManager?: boolean })?.isManager) {
    return NextResponse.json({ error: "Solo il manager può eliminare altri utenti" }, { status: 403 });
  }

  const { id } = await params;

  if (id === (session.user as { id: string }).id) {
    return NextResponse.json({ error: "Non puoi eliminare il tuo stesso account" }, { status: 400 });
  }

  await prisma.admin.delete({ where: { id } });

  return NextResponse.json({ success: true });
}