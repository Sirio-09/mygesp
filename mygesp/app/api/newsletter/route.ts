import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(req: Request) {
  let email: unknown;

  try {
    const body = (await req.json()) as { email?: unknown };
    email = body?.email;
  } catch {
    return NextResponse.json({ error: "Payload JSON non valido" }, { status: 400 });
  }

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email non valida" }, { status: 400 });
  }

  try {
    await prisma.newsletter.create({ data: { email: email.trim().toLowerCase() } });
    return NextResponse.json({ success: true });
  } catch (err) {
    // email già iscritta (constraint univoca): non è un errore da mostrare all'utente
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ success: true });
    }
    console.error("Errore iscrizione newsletter:", err);
    return NextResponse.json(
      { error: "Errore durante l'iscrizione alla newsletter." },
      { status: 500 }
    );
  }
}