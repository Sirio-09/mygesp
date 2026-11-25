import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limiter";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface User {
    role?: string;
    totpEnabled?: boolean;
    isManager?: boolean;
    mustChangePassword?: boolean;
    isVerified?: boolean;
  }
  interface Session {
    user: User & {
      id: string;
      email: string;
      /** Identificativo della singola sessione (lega la prova 2FA al login). */
      sid?: string;
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
    isVerified?: boolean;
    sid?: string;
  }
}

function clientIp(request?: Request): string {
  if (!request) return "unknown";
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "admin-login",
      credentials: { username: {}, password: {} },
      authorize: async (credentials, request) => {
        const ip = clientIp(request);
        const username =
          typeof credentials?.username === "string"
            ? credentials.username.trim().toLowerCase()
            : "";

        // Rate limit: max 20 tentativi/IP e 5 per singolo username in 15 minuti.
        const ipCheck = await rateLimit(`login:admin:ip:${ip}`, 20, 15 * 60 * 1000);
        const userCheck = username
          ? await rateLimit(`login:admin:user:${username}`, 5, 15 * 60 * 1000)
          : null;

        if (!ipCheck.allowed || (userCheck && !userCheck.allowed)) {
          console.warn(`Login admin bloccato per rate limiting (IP ${ip}).`);
          return null;
        }

        const admin = await prisma.admin.findFirst({
          // Ricerca case-insensitive: il rate limiting normalizza lo username in
          // minuscolo, quindi il lookup deve usare la stessa normalizzazione o
          // bastava cambiare maiuscole/minuscole per aggirare il limite per
          // utente (e per creare account dall'ortografia ambigua).
          where: { username: { equals: username, mode: "insensitive" } },
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
        };
      },
    }),
    Credentials({
      id: "customer-login",
      credentials: { email: {}, password: {} },
      authorize: async (credentials, request) => {
        const ip = clientIp(request);
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";

        const ipCheck = await rateLimit(
          `login:customer:ip:${ip}`,
          20,
          15 * 60 * 1000
        );
        const emailCheck = email
          ? await rateLimit(`login:customer:email:${email}`, 5, 15 * 60 * 1000)
          : null;

        if (!ipCheck.allowed || (emailCheck && !emailCheck.allowed)) {
          console.warn(`Login cliente bloccato per rate limiting (IP ${ip}).`);
          return null;
        }

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
          return null;
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