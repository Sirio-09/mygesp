import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import {
  ADMIN_2FA_COOKIE,
  verifyAdmin2faToken,
} from "@/lib/admin-2fa-token";

const { auth } = NextAuth(authConfig);

// In Next.js 16 il file convention `middleware.ts` è deprecato e rinominato
// `proxy.ts`. Il runtime è Node.js per default (v16+).
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as
    | {
        id?: string;
        role?: string;
        sid?: string;
        totpEnabled?: boolean;
        mustChangePassword?: boolean;
      }
    | undefined;

  const role = user?.role;
  const totpEnabled = user?.totpEnabled;
  const mustChangePassword = user?.mustChangePassword;
  const pathname = req.nextUrl.pathname;

  if (!pathname.startsWith("/admin")) return;

  // La verifica 2FA non è più un flag nel JWT (era falsificabile con
  // `useSession().update()` dal browser): si legge il cookie firmato e lo si
  // lega all'admin e alla sessione correnti. Il proxy resta comunque solo un
  // livello di UX: la vera autorizzazione è in `lib/admin-guard.ts` su ogni API.
  const proof = verifyAdmin2faToken(
    req.cookies.get(ADMIN_2FA_COOKIE)?.value
  );
  const otpVerified =
    !!proof &&
    !!user?.id &&
    !!user.sid &&
    proof.adminId === user.id &&
    proof.sessionId === user.sid;

  const isLoginPage = pathname === "/admin/login";
  const is2faSetupPage = pathname === "/admin/2fa-setup";
  const is2faVerifyPage = pathname === "/admin/2fa-verify";
  const is2faRecoveryPage = pathname === "/admin/2fa-recovery";
  const is2faPage = is2faSetupPage || is2faVerifyPage || is2faRecoveryPage;
  const isCambiaPasswordPage = pathname === "/admin/cambia-password";

  // 1. Se è già autenticato e verificato, non deve accedere alla pagina di Login
  if (isLoginPage) {
    if (isLoggedIn && otpVerified && !mustChangePassword) {
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

  // 4. PRIORITÀ 2: VERIFICA / SETUP / RECUPERO 2FA
  // Nota: /admin/cambia-password non è escluso qui apposta. Chi ha già
  // completato il 2FA può aprirla quando vuole (self-service); chi non l'ha
  // ancora fatto ricade in questo ramo e viene rimandato al flusso forzato.
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

