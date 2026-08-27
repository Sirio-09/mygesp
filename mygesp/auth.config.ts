import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
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
          token.otpVerified = false;
        }
      }

      if (trigger === "update" && updateData) {
        const newMustChange =
          updateData.mustChangePassword ?? updateData.user?.mustChangePassword;
        const newOtpVerified =
          updateData.otpVerified ?? updateData.user?.otpVerified;
        const newTotpEnabled =
          updateData.totpEnabled ?? updateData.user?.totpEnabled;
        const newIsVerified =
          updateData.isVerified ?? updateData.user?.isVerified;

        if (typeof newMustChange === "boolean") {
          token.mustChangePassword = newMustChange;
        }
        if (typeof newOtpVerified === "boolean") {
          token.otpVerified = newOtpVerified;
        }
        if (typeof newTotpEnabled === "boolean") {
          token.totpEnabled = newTotpEnabled;
        }
        if (typeof newIsVerified === "boolean") {
          token.isVerified = newIsVerified;
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;

        if (token.role === "admin") {
          session.user.totpEnabled = token.totpEnabled;
          session.user.isManager = token.isManager;
          session.user.mustChangePassword = token.mustChangePassword;
          session.user.otpVerified = token.otpVerified;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;