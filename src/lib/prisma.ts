import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL

// Pool for app queries (public schema)
const appPool = new Pool({
  connectionString,
})

// Pool for Better Auth queries (betterauth schema)
const authPool = new Pool({
  connectionString,
})

// Set search_path for auth pool to betterauth schema
authPool.on("connect", (client) => {
  client.query("SET search_path TO betterauth")
})

const appAdapter = new PrismaPg(appPool)
const authAdapter = new PrismaPg(authPool)

declare global {
  var prisma: PrismaClient | undefined
  var authPrisma: PrismaClient | undefined
}

// App client for public schema queries
export const client = globalThis.prisma || new PrismaClient({ adapter: appAdapter })

// Auth client for betterauth schema queries
export const authClient = globalThis.authPrisma || new PrismaClient({ adapter: authAdapter })

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = client
  globalThis.authPrisma = authClient
}
