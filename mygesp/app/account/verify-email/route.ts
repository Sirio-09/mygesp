import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 1. Usa req.nextUrl che gestisce in automatico l'URL senza far fallire il build
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/account/login?error=token-mancante", req.nextUrl)
    );
  }

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.redirect(
        new URL("/account/login?error=token-scaduto", req.nextUrl)
      );
    }

    // 2. Marca l'utente come verificato nel database
    await prisma.customer.update({
      where: { id: record.customerId },
      data: { isVerified: true },
    });

    // 3. Elimina il token per prevenirne il riutilizzo
    await prisma.verificationToken.delete({
      where: { id: record.id },
    });

    // 4. Reindirizza alla pagina di login in modo sicuro
    return NextResponse.redirect(
      new URL("/account/login?verified=true", req.nextUrl)
    );
  } catch (error) {
    console.error("Errore verifica email:", error);
    return NextResponse.redirect(
      new URL("/account/login?error=server-error", req.nextUrl)
    );
  }
}