import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { authClient } from "./prisma"

export const auth = betterAuth({
  appName: "TradeMentor",
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(authClient, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
      strategy: "compact" // or "jwt" or "jwe" for encrypted
    }
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    "https://trade-pulse-one.vercel.app",
  ],
})

export type Session = typeof auth.$Infer.Session
