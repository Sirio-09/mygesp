import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string })?.role;
  const otpVerified = (req.auth?.user as { otpVerified?: boolean })?.otpVerified;
  const mustChangePassword = (req.auth?.user as { mustChangePassword?: boolean })?.mustChangePassword;
  const pathname = req.nextUrl.pathname;

  // Applica il middleware solo alle rotte /admin
  if (!pathname.startsWith("/admin")) return;

  const isLoginPage = pathname === "/admin/login";
  const is2faPage = pathname.startsWith("/admin/2fa");
  const isCambiaPasswordPage = pathname === "/admin/cambia-password";

  // 1. UTENTE NON AUTENTICATO
  if (!isLoggedIn || role !== "admin") {
    if (isLoginPage) return; // Permetti la visione della pagina di login
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // 2. UTENTE GIÀ AUTENTICATO SULLA PAGINA DI LOGIN
  if (isLoginPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 3. PRIORITÀ 1: OBBLIGO CAMBIO PASSWORD
  if (mustChangePassword) {
    if (!isCambiaPasswordPage) {
      return NextResponse.redirect(new URL("/admin/cambia-password", req.url));
    }
    return; // Consenti la permanenza su /admin/cambia-password
  }

  // Blocco di sicurezza: se la password non va cambiata, vieta l'accesso a cambia-password
  if (!mustChangePassword && isCambiaPasswordPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 4. PRIORITÀ 2: VERIFICA 2FA
  if (!otpVerified) {
    if (!is2faPage) {
      return NextResponse.redirect(new URL("/admin/2fa-verify", req.url));
    }
    return; // Consenti la permanenza sulle pagine 2FA
  }

  // Blocco di sicurezza: se 2FA è già verificato, vieta l'accesso alle pagine 2FA
  if (otpVerified && is2faPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return;
});

export const config = {
  matcher: ["/admin/:path*"],
};