import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface User {
    role?: string;
    totpEnabled?: boolean;
    isManager?: boolean;
    mustChangePassword?: boolean;
    otpVerified?: boolean;
    isVerified?: boolean;
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
    isVerified?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
          totpEnabled: admin.totpEnabled,
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
        const email = (credentials.email as string)?.trim().toLowerCase();
        const customer = await prisma.customer.findUnique({
          where: { email },
        });

        if (!customer) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          customer.password
        );
        if (!valid) return null;

        if (!customer.isVerified) {
          throw new Error("Devi prima confermare il tuo indirizzo email per accedere.");
        }

        return {
          id: customer.id,
          email: customer.email,
          role: "customer",
          isVerified: customer.isVerified,
        };
      },
    }),
  ],
});