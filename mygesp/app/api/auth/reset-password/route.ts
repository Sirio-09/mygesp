import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link non valido o scaduto" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.customer.update({
    where: { id: resetToken.customerId },
    data: { password: hashedPassword },
  });

  // elimina il token subito dopo l'uso: non deve essere riutilizzabile
  await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

  return NextResponse.json({ success: true });
}