import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/account/login?error=token-mancante`);
  }

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.redirect(
        `${baseUrl}/account/login?error=token-scaduto`
      );
    }

    // 1. Marca l'utente come verificato
    await prisma.customer.update({
      where: { id: record.customerId },
      data: { isVerified: true },
    });

    // 2. Rimuovi il token monouso
    await prisma.verificationToken.delete({
      where: { id: record.id },
    });

    // 3. Reindirizza al login con messaggio di successo
    return NextResponse.redirect(`${baseUrl}/account/login?verified=true`);
  } catch (error) {
    console.error("Errore verifica email:", error);
    return NextResponse.redirect(`${baseUrl}/account/login?error=server-error`);
  }
}