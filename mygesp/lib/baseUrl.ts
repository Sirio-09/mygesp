export function getBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL;

  if (!envUrl) return "http://localhost:3000";

  // Rimuove doppi "https://", "http://" e slash finali
  const cleanUrl = envUrl.replace(/^(https?:\/\/)+/i, "").replace(/\/+$/, "");

  return cleanUrl.startsWith("localhost")
    ? `http://${cleanUrl}`
    : `https://${cleanUrl}`;
}