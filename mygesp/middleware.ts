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
  const is2faSetupPage = pathname === "/admin/2fa-setup";
  const is2faVerifyPage = pathname === "/admin/2fa-verify";
  const is2faRecoveryPage = pathname === "/admin/2fa-recovery";
  const is2faPage = is2faSetupPage || is2faVerifyPage || is2faRecoveryPage;
  const isCambiaPasswordPage = pathname === "/admin/cambia-password";

  // 1. Se è già autenticato e verificato, non deve accedere alla pagina di Login
  if (isLoginPage) {
    if (isLoggedIn && otpVerified) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }
    return;
  }

  // 2. UTENTE NON AUTENTICATO -> Reindirizza a login
  if (!isLoggedIn || role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }

  // 3. PRIORITÀ 1: OBBLIGO CAMBIO PASSWORD
  if (mustChangePassword) {
    if (!isCambiaPasswordPage) {
      return NextResponse.redirect(new URL("/admin/cambia-password", req.nextUrl));
    }
    return;
  }

  if (!mustChangePassword && isCambiaPasswordPage) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  // 4. PRIORITÀ 2: VERIFICA / SETUP / RECUPERO 2FA
  if (!otpVerified) {
    if (is2faRecoveryPage) return;

    if (!totpEnabled) {
      if (!is2faSetupPage) {
        return NextResponse.redirect(new URL("/admin/2fa-setup", req.nextUrl));
      }
      return;
    }

    if (!is2faVerifyPage) {
      return NextResponse.redirect(new URL("/admin/2fa-verify", req.nextUrl));
    }
    return;
  }

  // 5. Se è già verificato ma tenta di andare sulle pagine 2FA, lo mandiamo alla dashboard
  if (otpVerified && is2faPage) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/admin/:path*"],
};