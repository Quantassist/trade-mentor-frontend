# Authentication & API Conventions

This document outlines the conventions used for authentication and API patterns in this repository.

## Table of Contents
- [Authentication Architecture](#authentication-architecture)
- [Session Management](#session-management)
- [Data Access Layer](#data-access-layer)
- [API Routes](#api-routes)
- [Navigation & Routing](#navigation--routing)
- [Client vs Server Components](#client-vs-server-components)

---

## Authentication Architecture

### Stack
- **Auth Provider:** Better Auth (`better-auth`)
- **Database:** Prisma with PostgreSQL
- **Session Storage:** Cookie-based with optional cookie caching

### Key Files
```
src/lib/auth.ts           ← Better Auth server configuration
src/lib/auth-client.ts    ← Better Auth client (useSession, signIn, signOut)
src/lib/get-session.ts    ← Cached session wrapper for server components
src/lib/get-app-user.ts   ← Resolves betterAuthId to internal appUser.id
src/proxy.ts              ← Next.js 16 proxy (replaces middleware)
```

### User ID Types
There are **two different user IDs** in this system:

| ID Type | Source | Usage |
|---------|--------|-------|
| `betterAuthId` | `session.user.id` | Auth provider ID, used for auth operations |
| `appUser.id` | `AppUser` table | Internal user ID, used for all database queries |

**Important:** Always use `appUser.id` for Prisma queries, not `betterAuthId`.

```typescript
// ❌ Wrong - using auth provider ID directly
const posts = await client.post.findMany({
  where: { authorId: session.user.id }  // This is betterAuthId!
})

// ✅ Correct - resolve to appUser.id first
import { getAppUserId } from "@/lib/get-app-user"
const userId = await getAppUserId()
const posts = await client.post.findMany({
  where: { authorId: userId }  // This is appUser.id
})
```

---

## Session Management

### Cookie Cache Configuration
Cookie caching is enabled to reduce database hits:

```typescript
// src/lib/auth.ts
session: {
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // 5 minutes
    strategy: "compact" // or "jwt" or "jwe"
  }
}
```

### Server-Side Session Access

**Always use the cached wrapper** - never call `auth.api.getSession()` directly:

```typescript
// src/lib/get-session.ts
import { cache } from "react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const getSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  })
})
```

Usage in server components:
```typescript
import { getSession } from "@/lib/get-session"

export default async function Page() {
  const session = await getSession()
  if (!session) redirect("/sign-in")
  // ...
}
```

### Client-Side Session Access

For components **inside** a `SessionProvider` (e.g., group layout):
```typescript
import { useSessionContext } from "@/components/providers/session-provider"

function MyComponent() {
  const { session } = useSessionContext()
  // Uses server-prefetched session - no API call!
}
```

For components **outside** a `SessionProvider`:
```typescript
import { useSession } from "@/lib/auth-client"

function MyComponent() {
  const { data: session } = useSession()
  // Makes API call to /api/auth/get-session
}
```

### Session Provider Pattern
To reduce client-side API calls, wrap layouts with `SessionProvider`:

```typescript
// In server component layout
import { SessionProvider } from "@/components/providers/session-provider"
import { getSession } from "@/lib/get-session"

export default async function Layout({ children }) {
  const session = await getSession()
  
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}
```

---

## Data Access Layer

### Architecture
```
src/data/           ← Pure data fetching functions (no auth checks)
src/actions/        ← Server actions with auth + RBAC + mutations
src/app/api/        ← API routes that call data layer functions
```

### Data Layer Functions (`src/data/`)
- Pure data fetching, no authentication logic
- Use React's `cache()` for request deduplication
- Accept `userId` as parameter (don't fetch internally)
- Return consistent structures matching original server actions

```typescript
// src/data/groups.ts
import { cache } from "react"
import { client } from "@/lib/prisma"

export const getGroupInfo = cache(async (
  groupId: string,
  userId?: string | null,
  locale?: string
) => {
  // Pure data fetching - userId passed in, not fetched
  const group = await client.group.findUnique({ where: { id: groupId } })
  // ...
})
```

### Server Actions (`src/actions/`)
- Include authentication checks
- Include RBAC permission checks
- Handle mutations (create, update, delete)
- Call `revalidatePath()` after mutations

```typescript
// src/actions/groups.ts
export const onUpdateGroup = async (groupId: string, data: GroupData) => {
  const user = await onAuthenticatedUser()
  if (!user.id) return { status: 401 }
  
  const role = await onGetUserGroupRole(groupId)
  if (!hasPermission(role, "group:edit")) return { status: 403 }
  
  // Perform mutation...
  revalidatePath(`/group/${groupId}`)
}
```

### API Routes (`src/app/api/`)
- Call data layer functions
- Resolve `appUser.id` using `getAppUserId()`
- Return JSON responses

```typescript
// src/app/api/groups/[groupid]/info/route.ts
import { getGroupInfo } from "@/data/groups"
import { getAppUserId } from "@/lib/get-app-user"

export async function GET(request, { params }) {
  const { groupid } = await params
  const userId = await getAppUserId()
  const locale = request.nextUrl.searchParams.get("locale")
  
  const result = await getGroupInfo(groupid, userId, locale)
  return NextResponse.json(result)
}
```

---

## Navigation & Routing

### next-intl Integration
This repo uses `next-intl` for internationalization. **Always use navigation utilities from `@/i18n/navigation`**:

```typescript
// ✅ Correct
import { Link, redirect, useRouter, usePathname } from "@/i18n/navigation"

// ❌ Wrong - don't use next/link or next/navigation directly
import Link from "next/link"
import { redirect } from "next/navigation"
```

### Link Paths
Always use **absolute paths** (starting with `/`):

```typescript
// ✅ Correct - absolute path
<Link href={`/group/${groupid}/messages`}>

// ❌ Wrong - relative path (appends to current URL)
<Link href={`group/${groupid}/messages`}>
```

### Redirect in Server Components
```typescript
import { redirect } from "@/i18n/navigation"
import { setRequestLocale } from "next-intl/server"

export default async function Page({ params }) {
  const { locale } = await params
  setRequestLocale(locale)
  
  // Redirect with locale
  return redirect({ href: `/group/${groupid}`, locale })
}
```

---

## Client vs Server Components

### Server Components (Default)
- Use `getSession()` for auth checks
- Use data layer functions directly
- Prefetch data with React Query's `prefetchQuery`

### Client Components (`"use client"`)
- Use `useSessionContext()` when inside `SessionProvider`
- Use `useSession()` when outside `SessionProvider`
- Use React Query hooks for data fetching

### Route Protection
Protect routes in **layouts**, not individual pages:

```typescript
// src/app/[locale]/group/[groupid]/layout.tsx
export default async function GroupLayout({ children }) {
  const user = await onAuthenticatedUser()
  if (!user.id) redirect("/sign-in")
  
  return <>{children}</>
}
```

---

## Quick Reference

### Imports Cheat Sheet
```typescript
// Auth - Server
import { getSession } from "@/lib/get-session"
import { getAppUserId } from "@/lib/get-app-user"
import { onAuthenticatedUser } from "@/actions/auth"

// Auth - Client (inside SessionProvider)
import { useSessionContext } from "@/components/providers/session-provider"

// Auth - Client (outside SessionProvider)
import { useSession, signIn, signOut } from "@/lib/auth-client"

// Navigation (always use these, not next/link or next/navigation)
import { Link, redirect, useRouter, usePathname } from "@/i18n/navigation"

// Data Layer
import { getGroupInfo } from "@/data/groups"
import { getChannelInfo } from "@/data/channels"
// etc.
```

### Common Patterns

**Get current user's internal ID:**
```typescript
const userId = await getAppUserId() // Returns appUser.id or null
```

**Check if user is authenticated:**
```typescript
const session = await getSession()
if (!session?.user) redirect("/sign-in")
```

**Prefetch data in layout:**
```typescript
await query.prefetchQuery({
  queryKey: ["group-info", groupid],
  queryFn: () => getGroupInfo(groupid, userId, locale),
  staleTime: 60000,
})
```
