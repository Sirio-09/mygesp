import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getBaseUrl, getSiteUrl } from "../baseUrl";

const ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXTAUTH_URL",
  "AUTH_URL",
] as const;

const originalEnv = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]])
) as Record<(typeof ENV_KEYS)[number], string | undefined>;

beforeEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
  // La risoluzione logga i valori "sporchi": silenziamo l'output nei test.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
  vi.restoreAllMocks();
});

describe("getBaseUrl", () => {
  it("usa localhost come fallback", () => {
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("normalizza un host senza schema", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "mygesp.it";

    expect(getBaseUrl()).toBe("https://mygesp.it");
  });

  it("mantiene http per localhost e rimuove lo slash finale", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000/";

    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("estrapola l'URL da un valore incollato male (markdown)", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "[https://mygesp.it](https://mygesp.it)";

    expect(getBaseUrl()).toBe("https://mygesp.it");
  });

  it("usa NEXTAUTH_URL quando NEXT_PUBLIC_SITE_URL non è impostata", () => {
    process.env.NEXTAUTH_URL = "https://staging.mygesp.it";

    expect(getBaseUrl()).toBe("https://staging.mygesp.it");
  });

  it("ripiega su localhost se il valore principale è inutilizzabile", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "not a url with spaces";
    process.env.NEXTAUTH_URL = "https://staging.mygesp.it";

    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("getSiteUrl è un alias con lo stesso comportamento", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://mygesp.it/";

    expect(getSiteUrl()).toBe(getBaseUrl());
    expect(getSiteUrl()).toBe("https://mygesp.it");
  });
});
