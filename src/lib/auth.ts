import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { Pool } from "pg"

// Use Better Auth's native pg adapter with betterauth schema
// Use DIRECT_URL (non-pgbouncer) for auth queries since we need search_path
const authPool = new Pool({
  connectionString: process.env.DIRECT_URL,
})

// Set search_path on each connection
authPool.on("connect", (client) => {
  client.query("SET search_path TO betterauth")
})

export const auth = betterAuth({
  appName: "TradeMentor",
  database: authPool,
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
  ],
})

export type Session = typeof auth.$Infer.Session
