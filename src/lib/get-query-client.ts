import { QueryClient } from "@tanstack/react-query"
import { cache } from "react"

/**
 * Server-side QueryClient factory using React's cache() for request deduplication.
 * This ensures one QueryClient per request, preventing memory leaks from
 * creating new instances on every server component render.
 */
export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
        },
      },
    })
)
