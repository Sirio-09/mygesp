/**
 * Estrae l'indirizzo IP del client dagli header del reverse proxy.
 * Supporta sia `x-forwarded-for` (primo IP della catena) sia `x-real-ip`.
 */
export function getClientIp(req?: Request): string {
  if (!req) return "unknown";

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
