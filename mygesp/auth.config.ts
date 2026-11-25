import type { NextAuthConfig } from "next-auth";

/**
 * Configurazione condivisa fra il server (`auth.ts`) e il proxy.
 *
 * Sicurezza: il ramo `trigger === "update"` viene invocato da
 * `useSession().update(...)`, cioè con dati che arrivano dal browser. In
 * precedenza accettava `otpVerified`, `mustChangePassword`, `totpEnabled` e
 * `isVerified`: un `update({ otpVerified: true })` dalla console del browser
 * disattivava di fatto il 2FA. Ora l'unica cosa aggiornabile è `totpEnabled`,
 * che serve solo a scegliere quale pagina di 2FA mostrare (la verifica reale
 * vive nel cookie firmato gestito da `/api/admin/2fa/verify`).
 */
export const authConfig = {
  providers: [],
  pages: {
    signIn: "/account/login",
  },
  callbacks: {
    jwt: async ({ token, user, trigger, session: updateData }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;

        if (user.role === "admin") {
          token.totpEnabled = user.totpEnabled;
          token.isManager = user.isManager;
          token.mustChangePassword = user.mustChangePassword;
        }
      }

      // Identificativo della singola sessione: lega la prova 2FA al login
      // corrente, così un accesso successivo deve rifare il secondo fattore.
      // Il fallback copre i token emessi prima di questa modifica.
      if (!token.sid) {
        token.sid = globalThis.crypto.randomUUID();
      }

      if (trigger === "update" && updateData) {
        const newTotpEnabled =
          updateData.totpEnabled ?? updateData.user?.totpEnabled;

        if (typeof newTotpEnabled === "boolean") {
          token.totpEnabled = newTotpEnabled;
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.user.sid = token.sid;

        if (token.role === "admin") {
          session.user.totpEnabled = token.totpEnabled;
          session.user.isManager = token.isManager;
          session.user.mustChangePassword = token.mustChangePassword;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
