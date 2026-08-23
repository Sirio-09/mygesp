import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  const role = (session?.user as { role?: string })?.role;

  if (!session || role !== "admin" || !userId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { newPassword } = await req.json();

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: "La password deve contenere almeno 8 caratteri" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.admin.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      mustChangePassword: false,
    },
  });

  return NextResponse.json({ success: true });
}