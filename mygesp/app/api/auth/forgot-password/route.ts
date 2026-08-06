import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();

  const customer = await prisma.customer.findUnique({ where: { email } });

  if (!customer) {
    return NextResponse.json({ success: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token, customerId: customer.id, expiresAt },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/account/reimposta-password?token=${token}`;

  await resend.emails.send({
    from: "MyGesp <onboarding@resend.dev>",
    to: email,
    subject: "Reimposta la tua password — MyGesp",
    html: `
      <h2>Reimposta la password</h2>
      <p>Hai richiesto di reimpostare la password del tuo account MyGesp.</p>
      <p><a href="${resetUrl}">Clicca qui per scegliere una nuova password</a></p>
      <p>Il link scade tra 30 minuti. Se non hai richiesto tu questa operazione, ignora questa email.</p>
    `,
  });

  return NextResponse.json({ success: true });
}