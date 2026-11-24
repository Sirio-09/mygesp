import dns from "dns/promises";

/** Avvolge una promise con un timeout, per non far pendere la registrazione. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("dns timeout")), ms)
    ),
  ]);
}

export async function hasValidMxRecords(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;

  try {
    const mxRecords = await withTimeout(dns.resolveMx(domain), 3000);
    // Dominio esistente ma senza record MX → email non recapitabile.
    return Array.isArray(mxRecords) && mxRecords.length > 0;
  } catch {
    // Fail-open: un errore DNS o un timeout non deve bloccare utenti legittimi.
    return true;
  }
}
