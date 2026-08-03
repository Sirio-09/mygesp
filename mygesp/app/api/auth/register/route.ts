import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email e password obbligatorie" }, { status: 400 });
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email già registrata" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const customer = await prisma.customer.create({
    data: { email, password: hashedPassword, name },
  });

  return NextResponse.json({ id: customer.id, email: customer.email });
}