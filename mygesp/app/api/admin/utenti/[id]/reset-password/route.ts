import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/resend";
import { requireAdmin } from "@/lib/admin-guard";
import { escapeHtml } from "@/lib/escape-html";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // 1. Solo un Manager, con sessione verificata (password + 2FA), può resettare.
    const guard = await requireAdmin({ requireManager: true });
    if (!guard.ok) return guard.response;

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: "ID utente mancante" }, { status: 400 });
    }

    if (userId === guard.adminId) {
      return NextResponse.json(
        { error: "Usa l'area Account e sicurezza per cambiare la tua password." },
        { status: 400 }
      );
    }

    // 2. Password temporanea robusta: 12 byte casuali (96 bit).
    const tempPassword = crypto.randomBytes(12).toString("base64url");
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const targetAdmin = await prisma.admin.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });

    if (!targetAdmin) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }

    // 3. Aggiorna l'utente imponendo il cambio password al prossimo accesso
    await prisma.admin.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
        // Il 2FA resta attivo: la nuova password da sola non basta a entrare.
      },
    });

    const emailResult = await sendEmail({
      to: targetAdmin.email,
      subject: "Nuova password temporanea MyGesp",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6;">
          <h2>Password reimpostata</h2>
          <p>Il responsabile ha generato una nuova password temporanea per l'account <strong>${escapeHtml(targetAdmin.username)}</strong>.</p>
          <p><strong>Password temporanea:</strong> <code style="font-size: 16px;">${escapeHtml(tempPassword)}</code></p>
          <p>Al prossimo accesso ti verrà richiesto di sceglierne una nuova.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      emailSent: emailResult.ok,
      ...(emailResult.ok ? {} : { tempPassword }),
      message: emailResult.ok
        ? "Password reimpostata. Le credenziali sono state inviate via email all'utente."
        : "Password reimpostata, ma l'email non è stata inviata (RESEND_API_KEY non configurata). Comunica tu la password temporanea.",
    });
  } catch {
    return NextResponse.json(
      { error: "Errore durante il reset della password." },
      { status: 500 }
    );
  }
}