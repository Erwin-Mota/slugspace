import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile, account, user }) {
      console.log("🔐 SignIn callback triggered");
      console.log("Provider:", account?.provider);
      console.log("Profile email:", profile?.email);
      
      // Auto-create user analytics entry on first login
      if (user?.id) {
        try {
          await prisma.userAnalytics.upsert({
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
          });
        } catch (error) {
          console.error("Error updating user analytics:", error);
        }
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect callback - URL:", url, "BaseURL:", baseUrl);
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
    async session({ session, user }) {
      if (user?.id && session.user) {
        (session.user as any).id = user.id;
        
        // Add user analytics to session
        try {
          const analytics = await prisma.userAnalytics.findUnique({
            where: { userId: user.id },
          });
          (session.user as any).analytics = analytics;
        } catch (error) {
          console.error("Error fetching user analytics:", error);
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
    signOut: "/",
  },
  session: {
    strategy: "database", // Use database sessions for better integration
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
