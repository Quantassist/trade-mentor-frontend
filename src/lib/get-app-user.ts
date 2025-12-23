import { getSession } from "@/lib/get-session"
import { client } from "@/lib/prisma"
import { cache } from "react"

/**
 * Get the appUser ID from the current session.
 * This resolves the betterAuthId to the actual appUser.id used in the database.
 * Returns undefined if not authenticated.
 */
export const getAppUserId = cache(async (): Promise<string | undefined> => {
  const session = await getSession()
  if (!session?.user?.id) return undefined

  const appUser = await client.appUser.findUnique({
    where: { betterAuthId: session.user.id },
    select: { id: true },
  })

  return appUser?.id
})
