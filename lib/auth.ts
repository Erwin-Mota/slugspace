import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";

// Lazy import prisma to avoid connection during build
function getPrisma() {
  return require("@/lib/prisma").prisma;
}

const providers = [];

// Only add providers if credentials are available
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: { params: { scope: 'read:user user:email' } },
    })
  );
}

if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: { params: { scope: 'openid email profile' } },
    })
  );
}

export const authOptions: NextAuthOptions = {
  // Lazy adapter initialization - only connect when actually used
  adapter: PrismaAdapter(getPrisma()),
  providers,
  callbacks: {
    async signIn({ profile, account, user }) {
      // Auto-create user analytics entry on first login
      if (user?.id) {
        try {
          // Fire-and-forget to avoid blocking the OAuth flow
          getPrisma().userAnalytics.upsert({
            where: { userId: user.id },
            update: {
              loginCount: { increment: 1 },
              lastLoginAt: new Date(),
            },
            create: {
              userId: user.id,
              loginCount: 1,
              lastLoginAt: new Date(),
            },
          }).catch(() => {});
        } catch (error) {
          // Ignore analytics errors to keep auth fast
        }
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
    async session({ session, token }) {
      // Attach user id from JWT without DB lookup
      if (session.user && token?.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
    signOut: "/",
  },
  // Use JWT sessions for speed (avoids DB round-trips on every request)
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};

