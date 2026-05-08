import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const FALLBACK_ADMIN_EMAIL = process.env.ADMIN_LOGIN_EMAIL ?? "admin@bpholding.net";
const FALLBACK_ADMIN_PASSWORD = process.env.ADMIN_LOGIN_PASSWORD ?? "Admin@12345";

function normalizeRedirectUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  // Already relative, safe to use
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`;

    if (relative.startsWith("/") && !relative.startsWith("//")) {
      return relative;
    }
  } catch {
    return null;
  }

  return null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret:
    process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "bp-holding-dev-secret",
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const normalizedEmail = parsed.data.email.toLowerCase().trim();

        if (!process.env.DATABASE_URL) {
          if (
            normalizedEmail === FALLBACK_ADMIN_EMAIL.toLowerCase() &&
            parsed.data.password === FALLBACK_ADMIN_PASSWORD
          ) {
            return {
              id: "admin-dev",
              email: normalizedEmail,
              name: "BP Holding Admin",
              role: "ADMIN" as const,
            };
          }

          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const passwordMatches = await compare(parsed.data.password, user.passwordHash);

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "CLIENT";
      }

      if (!token.role) {
        token.role = "CLIENT";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = (token.role as Role | undefined) ?? "CLIENT";
        session.user.email = session.user.email ?? "";
        session.user.name = session.user.name ?? "";
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Normalize absolute URLs to relative paths
      const normalized = normalizeRedirectUrl(url);
      if (normalized) {
        return normalized;
      }

      // Only allow redirects to same origin or relative paths
      if (url.startsWith("/")) return url;
      if (new URL(url).origin === new URL(baseUrl).origin) return url;
      return baseUrl;
    },
  },
});
