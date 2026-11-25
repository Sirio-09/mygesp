import crypto from "crypto";

/**
 * Prova crittografica di "2FA completato" per le sessioni admin.
 *
 * Il flag `otpVerified` nel JWT non è più utilizzabile come autorizzazione:
 * veniva scritto anche da `useSession().update()` lato client, quindi un
 * `update({ otpVerified: true })` dalla console del browser scavalcava il
 * secondo fattore. Ora la verifica vive in un cookie httpOnly firmato con HMAC
 * (stesso segreto di NextAuth) e legato a:
 *
 * - `adminId`  → l'admin che ha inserito il codice;
 * - `sessionId`→ il `sid` del JWT corrente, così un nuovo login invalida la
 *   prova precedente (il 2FA va rifatto a ogni accesso);
 * - `expiresAt`→ scadenza assoluta (8 ore).
 *
 * Il cookie è verificabile anche nel proxy (runtime Node), che può così
 * decidere i redirect senza interrogare il database.
 */

export const ADMIN_2FA_COOKIE = "mg_admin_2fa";

/** Durata massima della prova 2FA (8 ore). */
export const ADMIN_2FA_TTL_SECONDS = 8 * 60 * 60;

export type Admin2faProof = {
  adminId: string;
  sessionId: string;
  expiresAt: number;
};

function getSecret(): string | null {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.TOTP_ENCRYPTION_KEY ||
    null
  );
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) return false;

  return crypto.timingSafeEqual(bufferA, bufferB);
}

/** Crea il valore del cookie di prova 2FA (null se il segreto non è configurato). */
export function createAdmin2faToken(
  adminId: string,
  sessionId: string
): string | null {
  const secret = getSecret();

  if (!secret) {
    console.error(
      "[admin-2fa] AUTH_SECRET/NEXTAUTH_SECRET non configurato: impossibile firmare la prova 2FA."
    );
    return null;
  }

  if (!adminId || !sessionId) return null;

  const expiresAt = Date.now() + ADMIN_2FA_TTL_SECONDS * 1000;
  const payload = `${adminId}.${sessionId}.${expiresAt}`;

  return `${payload}.${sign(payload, secret)}`;
}

/** Verifica firma, scadenza e formato del cookie di prova 2FA. */
export function verifyAdmin2faToken(
  token: string | null | undefined
): Admin2faProof | null {
  if (!token) return null;

  const secret = getSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 4) return null;

  const [adminId, sessionId, expiresAtRaw, signature] = parts;

  if (!adminId || !sessionId || !expiresAtRaw || !signature) return null;
  if (!safeEqual(signature, sign(`${adminId}.${sessionId}.${expiresAtRaw}`, secret))) {
    return null;
  }

  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;

  return { adminId, sessionId, expiresAt };
}

/** Opzioni cookie coerenti fra set e delete. */
export function admin2faCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_2FA_TTL_SECONDS,
  };
}
