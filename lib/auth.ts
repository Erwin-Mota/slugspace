import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";

// Import prisma - adapter needs it at initialization
import { prisma } from "@/lib/prisma";

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
  // Use adapter to create users in database, but JWT for sessions
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    async signIn({ profile, account, user }) {
      // Allow sign in
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
    async session({ session, token, user }) {
      // Attach user id and data to session
      if (token?.sub) {
        (session.user as any).id = token.sub;
      }
      if (token?.email) {
        session.user.email = token.email as string;
      }
      if (token?.name) {
        session.user.name = token.name as string;
      }
      if (token?.picture) {
        session.user.image = token.picture as string;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in - user object is available (created by PrismaAdapter)
      // The adapter creates the user in DB and passes it here
      if (user) {
        token.sub = user.id; // This is the database user ID from adapter
        token.email = user.email || token.email;
        token.name = user.name || token.name;
        token.picture = user.image || token.picture;
      }
      // Fallback: Update from profile if user object isn't available
      if (profile && !token.sub) {
        token.email = profile.email || token.email;
        token.name = profile.name || token.name;
        token.picture = (profile as any).picture || (profile as any).image || token.picture;
      }
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
  debug: process.env.NODE_ENV === 'development', // Enable debug in dev
};

