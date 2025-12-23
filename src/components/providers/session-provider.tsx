"use client"

import { createContext, ReactNode, useContext } from "react"

type Session = {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  session: {
    id: string
    userId: string
    expiresAt: Date
  }
} | null

type SessionContextType = {
  session: Session
  isLoading: boolean
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
})

/**
 * Session Provider - Provides server-fetched session to client components.
 * This eliminates the need for multiple useSession() calls that hit the API.
 * 
 * Usage:
 * 1. In a server component/layout, fetch session with getSession()
 * 2. Wrap client components with <SessionProvider session={session}>
 * 3. In client components, use useSessionContext() instead of useSession()
 */
export function SessionProvider({
  children,
  session,
}: {
  children: ReactNode
  session: Session
}) {
  return (
    <SessionContext.Provider value={{ session, isLoading: false }}>
      {children}
    </SessionContext.Provider>
  )
}

/**
 * Use this hook in client components instead of useSession() from better-auth.
 * This uses the server-prefetched session, avoiding additional API calls.
 */
export function useSessionContext() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider")
  }
  return context
}
