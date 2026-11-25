import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADMIN_2FA_COOKIE,
  ADMIN_2FA_TTL_SECONDS,
  admin2faCookieOptions,
  createAdmin2faToken,
  verifyAdmin2faToken,
} from "../admin-2fa-token";

const SECRET = "segreto-di-test-lungo-abbastanza-1234567890";

beforeEach(() => {
  process.env.AUTH_SECRET = SECRET;
  delete process.env.NEXTAUTH_SECRET;
  delete process.env.TOTP_ENCRYPTION_KEY;
});

afterEach(() => {
  vi.useRealTimers();
  delete process.env.AUTH_SECRET;
});

describe("createAdmin2faToken / verifyAdmin2faToken", () => {
  it("emette una prova valida e leggibile con gli stessi identificativi", () => {
    const token = createAdmin2faToken("admin_1", "session-abc");

    expect(token).toBeTypeOf("string");

    const proof = verifyAdmin2faToken(token);

    expect(proof).not.toBeNull();
    expect(proof?.adminId).toBe("admin_1");
    expect(proof?.sessionId).toBe("session-abc");
    expect(proof?.expiresAt).toBeGreaterThan(Date.now());
  });

  it("rifiuta un token firmato con un altro segreto", () => {
    const token = createAdmin2faToken("admin_1", "session-abc");

    process.env.AUTH_SECRET = "un-altro-segreto";

    expect(verifyAdmin2faToken(token)).toBeNull();
  });

  it("rifiuta la manomissione di adminId, sessionId o scadenza", () => {
    const token = createAdmin2faToken("admin_1", "session-abc")!;
    const [adminId, sessionId, expiresAt, signature] = token.split(".");

    expect(
      verifyAdmin2faToken([`${adminId}x`, sessionId, expiresAt, signature].join("."))
    ).toBeNull();
    expect(
      verifyAdmin2faToken([adminId, `${sessionId}x`, expiresAt, signature].join("."))
    ).toBeNull();
    expect(
      verifyAdmin2faToken([adminId, sessionId, "99999999999999", signature].join("."))
    ).toBeNull();
  });

  it("rifiuta token scaduti", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    const token = createAdmin2faToken("admin_1", "session-abc")!;

    expect(verifyAdmin2faToken(token)).not.toBeNull();

    vi.setSystemTime(
      new Date(Date.now() + (ADMIN_2FA_TTL_SECONDS + 1) * 1000)
    );

    expect(verifyAdmin2faToken(token)).toBeNull();
  });

  it("ignora token assenti o malformati", () => {
    expect(verifyAdmin2faToken(undefined)).toBeNull();
    expect(verifyAdmin2faToken("")).toBeNull();
    expect(verifyAdmin2faToken("a.b.c")).toBeNull();
    expect(verifyAdmin2faToken("non-un-token")).toBeNull();
  });

  it("non emette token se manca il segreto o un identificativo", () => {
    const originalSecret = process.env.AUTH_SECRET;
    delete process.env.AUTH_SECRET;

    expect(createAdmin2faToken("admin_1", "session-abc")).toBeNull();

    process.env.AUTH_SECRET = originalSecret;

    expect(createAdmin2faToken("", "session-abc")).toBeNull();
    expect(createAdmin2faToken("admin_1", "")).toBeNull();
  });

  it("usa il nome cookie e le opzioni attese", () => {
    expect(ADMIN_2FA_COOKIE).toBe("mg_admin_2fa");

    const options = admin2faCookieOptions();

    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.maxAge).toBe(ADMIN_2FA_TTL_SECONDS);
  });
});
