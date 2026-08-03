import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "admin-login",
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email as string },
        });
        if (!admin) return null;
        const valid = await bcrypt.compare(credentials.password as string, admin.password);
        if (!valid) return null;
        return { id: admin.id, email: admin.email, role: "admin" };
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
        const valid = await bcrypt.compare(credentials.password as string, customer.password);
        if (!valid) return null;
        return { id: customer.id, email: customer.email, role: "customer" };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: { signIn: "/admin/login" },
});