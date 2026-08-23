import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface User {
    role?: string;
    totpEnabled?: boolean;
    isManager?: boolean;
    mustChangePassword?: boolean;
    otpVerified?: boolean;
  }
  interface Session {
    user: User & {
      id: string;
      email: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    totpEnabled?: boolean;
    isManager?: boolean;
    mustChangePassword?: boolean;
    otpVerified?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "admin-login",
      credentials: { username: {}, password: {} },
      authorize: async (credentials) => {
        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username as string },
        });
        if (!admin) return null;

        const validPassword = await bcrypt.compare(
          credentials.password as string,
          admin.password
        );
        if (!validPassword) return null;

        return {
          id: admin.id,
          email: admin.email,
          role: "admin",
          totpEnabled: admin.totpEnabled, // Legge se ha già abilitato il 2FA
          isManager: admin.isManager,
          mustChangePassword: admin.mustChangePassword,
          otpVerified: false,
        };
      },
    }),
    Credentials({
      id: "customer-login",
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const customer = await prisma.customer.findUnique({
          where: { email: credentials.email as string },
        });
        if (!customer) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          customer.password
        );
        if (!valid) return null;

        return {
          id: customer.id,
          email: customer.email,
          role: "customer",
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session: updateData }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        if (user.role === "admin") {
          token.totpEnabled = user.totpEnabled;
          token.isManager = user.isManager;
          token.mustChangePassword = user.mustChangePassword;
          token.otpVerified = false;
        }
      }

      // Gestione degli aggiornamenti via `update()`
      if (trigger === "update" && updateData) {
        const newMustChange =
          updateData.mustChangePassword ?? updateData.user?.mustChangePassword;
        const newOtpVerified =
          updateData.otpVerified ?? updateData.user?.otpVerified;
        const newTotpEnabled =
          updateData.totpEnabled ?? updateData.user?.totpEnabled;

        if (typeof newMustChange === "boolean") {
          token.mustChangePassword = newMustChange;
        }
        if (typeof newOtpVerified === "boolean") {
          token.otpVerified = newOtpVerified;
        }
        // AGGIUNTO: Permette di aggiornare totpEnabled dinamico dopo il setup del 2FA o il reset
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
  pages: { signIn: "/admin/login" },
});