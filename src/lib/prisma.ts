import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const connectionString = process.env.DATABASE_URL

// Use PrismaPg adapter with connection string (pgbouncer-compatible)
// Prisma handles multi-schema via @@schema() directives in schema.prisma
const adapter = new PrismaPg({ connectionString: connectionString! })

declare global {
  var prisma: PrismaClient | undefined
}

// Single Prisma client - handles both public and betterauth schemas
// via @@schema() directives in schema.prisma
export const client = globalThis.prisma || new PrismaClient({ adapter })

// Export as authClient for Better Auth compatibility
export const authClient = client

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = client
}
