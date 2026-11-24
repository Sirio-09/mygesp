import { Resend } from "resend";

/**
 * Client Resend inizializzato in modo lazy.
 *
 * Il costruttore lancia "Missing API key" se `RESEND_API_KEY` non è definita:
 * istanziarlo a livello di modulo rendeva impossibile caricare le route che lo
 * importavano, anche quando l'email non serviva (es. pagina ordini admin).
 */
let resendClient: Resend | null = null;

export const EMAIL_FROM =
  process.env.EMAIL_FROM || "MyGesp <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY non configurata: aggiungila al file .env.local per abilitare l'invio delle email."
    );
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export type SendEmailResult = { ok: true } | { ok: false; error: string };

/**
 * Invio email "best effort": non lancia mai eccezioni e non blocca i flussi
 * applicativi se Resend non è configurato o se l'API risponde con un errore.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: EmailPayload): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    console.warn(
      `RESEND_API_KEY non configurata: email non inviata a ${to} ("${subject}").`
    );
    return { ok: false, error: "RESEND_API_KEY non configurata" };
  }

  try {
    const { error } = await getResendClient().emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Errore Resend:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Errore invio email:", message);
    return { ok: false, error: message };
  }
}