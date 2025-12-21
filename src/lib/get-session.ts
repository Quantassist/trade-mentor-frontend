import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { cache } from "react"

/**
 * Cached session getter - ensures only ONE session fetch per request.
 * Use this in all server components, layouts, pages, and server actions.
 * 
 * DO NOT use auth.api.getSession() directly - always use this wrapper.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  })
})
