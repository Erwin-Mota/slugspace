import { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extended Session interface to include custom user properties
   */
  interface Session {
    user: {
      id: string
      role?: string
      major?: string
      year?: string
      college?: string
      interests?: string[]
    } & DefaultSession["user"]
  }

  /**
   * Extended User interface to include custom properties
   */
  interface User {
    id: string
    role?: string
    major?: string
    year?: string
    college?: string
    interests?: string[]
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT interface
   */
  interface JWT {
    id: string
    role?: string
    major?: string
    year?: string
    college?: string
  }
}

