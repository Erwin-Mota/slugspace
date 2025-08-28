import NextAuth, { NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../../lib/prisma";

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email"
        }
      }
    }),
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ profile, account, user }) {
      // 🎯 Auto-create user profile if first time
      if (profile?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email }
        });
        
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name || (profile as any).login || (profile as any).given_name || profile.email.split('@')[0],
              image: (profile as any).avatar_url || (profile as any).picture,
            }
          });
        }
      }
      
      return true;
    },
    
    async session({ session, token }) {
      // 🔗 Attach user ID and additional data to session
      if (token.sub && session.user) {
        (session.user as any).id = token.sub;
        
        // 🎭 Fetch user's personality traits and preferences
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            major: true,
            year: true,
            college: true,
            personalityTraits: true,
            joinedClubs: {
              include: {
                club: {
                  select: { id: true, name: true, category: true }
                }
              }
            },
            studyGroups: {
              include: {
                course: {
                  select: { id: true, code: true, name: true }
                }
              }
            }
          }
        });
        
        if (user) {
          session.user = {
            ...session.user,
            ...user
          };
        }
      }
      
      return session;
    },
    
    async jwt({ token, user, account }) {
      // 🔐 Handle JWT token updates
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
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // 🛡️ Security configurations
  secret: process.env.NEXTAUTH_SECRET,
  
  // 🚀 Performance optimizations
  debug: process.env.NODE_ENV === "development",
  
  // 🔒 Additional security
  useSecureCookies: process.env.NODE_ENV === "production",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 