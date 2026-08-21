import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email non valida" }, { status: 400 });
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email } });
    return NextResponse.json({ success: true });
  } catch {
    // email già iscritta: non è un errore da mostrare all'utente
    return NextResponse.json({ success: true });
  }
}