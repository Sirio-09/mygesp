import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string })?.role;
  const otpVerified = (req.auth?.user as { otpVerified?: boolean })?.otpVerified;
  const totpEnabled = (req.auth?.user as { totpEnabled?: boolean })?.totpEnabled;
  const mustChangePassword = (req.auth?.user as { mustChangePassword?: boolean })?.mustChangePassword;
  const pathname = req.nextUrl.pathname;

  if (!pathname.startsWith("/admin")) return;

  const isLoginPage = pathname === "/admin/login";
  const is2faSetupPage = pathname === "/admin/2fa-setup"; // Modifica qui se il percorso della tua pagina con il QR è diverso (es. /admin/2fa/setup)
  const is2faVerifyPage = pathname === "/admin/2fa-verify";
  const is2faPage = is2faSetupPage || is2faVerifyPage;
  const isCambiaPasswordPage = pathname === "/admin/cambia-password";

  // 1. Se la rotta è /admin/login, PERMETTI SEMPRE la visione della pagina
  if (isLoginPage) return;

  // 2. UTENTE NON AUTENTICATO -> Reindirizza a login
  if (!isLoggedIn || role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // 3. PRIORITÀ 1: OBBLIGO CAMBIO PASSWORD
  if (mustChangePassword) {
    if (!isCambiaPasswordPage) {
      return NextResponse.redirect(new URL("/admin/cambia-password", req.url));
    }
    return;
  }

  if (!mustChangePassword && isCambiaPasswordPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 4. PRIORITÀ 2: VERIFICA / SETUP 2FA
  if (!otpVerified) {
    // SCENARIO A: L'admin NON ha mai configurato il 2FA (o è stato resettato)
    if (!totpEnabled) {
      if (!is2faSetupPage) {
        return NextResponse.redirect(new URL("/admin/2fa-setup", req.url)); // <-- MANDA AL QR CODE
      }
      return;
    }

    // SCENARIO B: L'admin HA GIA' configurato il 2FA e deve solo inserire il codice
    if (totpEnabled) {
      if (!is2faVerifyPage) {
        return NextResponse.redirect(new URL("/admin/2fa-verify", req.url)); // <-- MANDA ALLE 6 CIFRE
      }
      return;
    }
  }

  // Se è già verificato ma sta provando a stare sulle pagine di 2FA, lo rimandiamo alla dashboard
  if (otpVerified && is2faPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return;
});

export const config = {
  matcher: ["/admin/:path*"],
};