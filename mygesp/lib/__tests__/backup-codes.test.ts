import crypto from "crypto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  findBackupCodeIndex,
  generateBackupCodes,
  hashBackupCode,
} from "../backup-codes";

const SECRET = "segreto-di-test-per-i-codici-di-recupero";

beforeEach(() => {
  process.env.AUTH_SECRET = SECRET;
  delete process.env.NEXTAUTH_SECRET;
  delete process.env.TOTP_ENCRYPTION_KEY;
});

describe("generateBackupCodes", () => {
  it("genera codici distinti nel formato XXXXXX-XXXXXX", () => {
    const { plain, hashed } = generateBackupCodes(8);

    expect(plain).toHaveLength(8);
    expect(new Set(plain).size).toBe(8);

    for (const code of plain) {
      expect(code).toMatch(/^[0-9A-F]{6}-[0-9A-F]{6}$/);
    }

    expect(hashed).toHaveLength(8);
    expect(new Set(hashed).size).toBe(8);
  });

  it("salva solo HMAC e non il codice in chiaro", () => {
    const { plain, hashed } = generateBackupCodes(1);

    expect(hashed[0]).toHaveLength(64);
    expect(hashed[0]).not.toBe(plain[0]);
    expect(hashed[0]).toBe(hashBackupCode(plain[0]));
    expect(hashed[0]).not.toBe(
      crypto.createHash("sha256").update(plain[0].replace("-", "")).digest("hex")
    );
  });

  it("dipende dal segreto del server (dump del DB insufficiente)", () => {
    const { plain, hashed } = generateBackupCodes(1);

    process.env.AUTH_SECRET = "un-altro-segreto";

    expect(hashBackupCode(plain[0])).not.toBe(hashed[0]);
  });
});

describe("findBackupCodeIndex", () => {
  it("trova il codice ignorando maiuscole, spazi e trattini", () => {
    const { plain, hashed } = generateBackupCodes(3);
    const typed = ` ${plain[1].toLowerCase().replace("-", " ")} `;

    expect(findBackupCodeIndex(hashed, typed)).toBe(1);
  });

  it("resta compatibile con gli hash SHA-256 delle versioni precedenti", () => {
    const legacyCode = "ABCD-1234";
    const legacyHash = crypto
      .createHash("sha256")
      .update(legacyCode.replace("-", ""))
      .digest("hex");

    expect(findBackupCodeIndex([legacyHash], "abcd-1234")).toBe(0);
  });

  it("resta compatibile con i codici salvati in chiaro", () => {
    expect(findBackupCodeIndex(["ABCD-1234"], "abcd1234")).toBe(0);
  });

  it("restituisce -1 per codici sconosciuti o input vuoto", () => {
    const { hashed } = generateBackupCodes(1);

    expect(findBackupCodeIndex(hashed, "AAAA-AAAA")).toBe(-1);
    expect(findBackupCodeIndex(hashed, "   ")).toBe(-1);
    expect(findBackupCodeIndex([], "ABCD-1234")).toBe(-1);
  });
});
