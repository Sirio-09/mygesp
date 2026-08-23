import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string })?.role;
  const otpVerified = (req.auth?.user as { otpVerified?: boolean })?.otpVerified;
  const mustChangePassword = (req.auth?.user as { mustChangePassword?: boolean })?.mustChangePassword;
  const pathname = req.nextUrl.pathname;

  if (!pathname.startsWith("/admin")) return;

  const isLoginPage = pathname === "/admin/login";
  const is2faPage = pathname.startsWith("/admin/2fa");
  const isCambiaPasswordPage = pathname === "/admin/cambia-password";

  // 1. Se la rotta è /admin/login, PERMETTI SEMPRE la visione della pagina
  // (permette di richiedere le credenziali ogni volta che si clicca su Area Tecnica)
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

  // 4. PRIORITÀ 2: VERIFICA 2FA
  if (!otpVerified) {
    if (!is2faPage) {
      return NextResponse.redirect(new URL("/admin/2fa-verify", req.url));
    }
    return;
  }

  if (otpVerified && is2faPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return;
});

export const config = {
  matcher: ["/admin/:path*"],
};