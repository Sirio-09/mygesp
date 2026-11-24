import crypto from "crypto";

/**
 * Cifratura dei segreti sensibili a riposo (es. `totpSecret` degli admin).
 *
 * Usa AES-256-GCM con IV casuale e authentication tag: il valore salvato nel DB
 * non è reversibile senza la chiave, e qualsiasi manomissione fa fallire la
 * decifratura invece di produrre dati corrotti in silenzio.
 *
 * Formato: `enc:v1:<iv base64>:<tag base64>:<ciphertext base64>`
 */
const PREFIX = "enc:v1:";

function getKey(): Buffer {
  const raw = process.env.TOTP_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;

  if (!raw) {
    throw new Error(
      "TOTP_ENCRYPTION_KEY (oppure NEXTAUTH_SECRET) non configurata: impossibile cifrare i segreti 2FA."
    );
  }

  // Derivazione deterministica a 32 byte per AES-256.
  return crypto.createHash("sha256").update(raw).digest();
}

export function isEncryptedSecret(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(stored: string): string {
  // Compatibilità con i segreti salvati in chiaro prima dell'introduzione della cifratura.
  if (!isEncryptedSecret(stored)) return stored;

  const [ivB64, tagB64, dataB64] = stored.slice(PREFIX.length).split(":");

  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Segreto 2FA cifrato in un formato non riconosciuto.");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivB64, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
