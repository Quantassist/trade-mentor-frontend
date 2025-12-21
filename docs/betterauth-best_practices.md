Below is a **clean, implementation-oriented SPEC document**

It is written as **rules + patterns + anti-patterns**, with **clear do/don’t instructions** so the agent can systematically rewrite an existing Next.js App Router + better-auth codebase into best practices.

---

# 📘 Better-Auth Session Usage Spec

**Target Stack:** Next.js App Router + better-auth
**Audience:** AI code-refactoring agent
**Goal:** Correct, performant, and secure session handling with minimal network calls

---

## 0. Core Principles (Non-Negotiable)

1. **Cookies are the source of truth**

   * Session data is stored in **HTTP-only cookies**
   * Server components can read them directly
   * Client components cannot

2. **Server first, client reactive**

   * All **auth checks and route protection happen on the server**
   * Client hooks are used **only for UI reactivity**

3. **Zero unnecessary session fetches**

   * Session must be fetched **once per request**
   * Reused across layouts, pages, and server components

---

## 1. Session Access Rules

### 1.1 Server Components (RSC, Layouts, Pages)

✅ **Allowed**

```ts
auth.api.getSession()
```

❌ **Forbidden**

```ts
useSession()
SessionProvider logic
```

### 1.2 Client Components

✅ **Allowed**

```ts
useSession()
signIn()
signOut()
```

❌ **Forbidden**

```ts
auth.api.getSession()
Auth-based redirects
```

---

## 2. Canonical Session Utility (MANDATORY)

### Rule

All server-side session access **must go through a cached wrapper**.

### Required File

```ts
// lib/get-session.ts
import { cache } from "react";
import { auth } from "@/lib/auth";

export const getSession = cache(async () => {
  return auth.api.getSession();
});
```

### Why

* Prevents repeated cookie parsing
* Ensures **1 session read per request**
* Enables deterministic refactoring

---

## 3. Root Layout Pattern (Session Hydration)

### Rule

The root layout **must fetch and hydrate the session exactly once**.

```ts
// app/layout.tsx
import { getSession } from "@/lib/get-session";
import { SessionProvider } from "better-auth/react";

export default async function RootLayout({ children }) {
  const session = await getSession();

  return (
    <html>
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Guarantees

* `useSession()` does **not refetch**
* No hydration mismatch
* Instant client availability

---

## 4. Route Protection (STRICT RULES)

### 4.1 Protected Routes MUST Use Layout Guards

✅ **Correct**

```ts
// app/(protected)/layout.tsx
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }) {
  const session = await getSession();

  if (!session) redirect("/login");

  return <>{children}</>;
}
```

❌ **Incorrect**

* Client redirects
* `useSession()` in layouts
* Middleware for normal pages (see section 5)

---

### 4.2 Page-Level Protection (Allowed but Secondary)

```ts
// app/dashboard/page.tsx
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <Dashboard />;
}
```

---

### 4.3 Client-Side Protection (ANTI-PATTERN)

❌ **Must be refactored**

```ts
"use client";
const { session } = useSession();
if (!session) router.push("/login");
```

Reason:

* Flash of protected content
* Extra network calls
* Poor SEO & UX

---

## 5. Middleware Usage (LIMITED SCOPE)

### Middleware SHOULD be used ONLY for:

* API route protection
* Admin / security-critical paths
* Hard request blocking

### Middleware SHOULD NOT be used for:

* Normal dashboards
* App pages
* UI-level auth

```ts
// middleware.ts
export const config = {
  matcher: ["/api/private/:path*", "/admin/:path*"],
};
```

**Default rule:**

> If a layout can protect it, **do not use middleware**.

---

## 6. Client Components & Hooks

### 6.1 `useSession()` Usage Rules

✅ Allowed ONLY for:

* Showing user info
* Login / logout buttons
* Reactive UI changes

```ts
"use client";
import { useSession } from "better-auth/react";

export function UserMenu() {
  const { session, status } = useSession();

  if (status === "loading") return null;
  if (!session) return <LoginButton />;

  return <span>{session.user.name}</span>;
}
```

❌ Not allowed for:

* Route protection
* Data fetching
* Authorization decisions

---

### 6.2 Expected Behavior

| Scenario                      | Behavior                  |
| ----------------------------- | ------------------------- |
| Session provided via provider | No network call           |
| No provider                   | Fetch `/api/auth/session` |
| Login/logout                  | Revalidation + rerender   |

---

## 7. Authorization (Roles / Permissions)

### Rule

Authorization checks happen **on the server**.

```ts
const session = await getSession();

if (session.user.role !== "admin") {
  redirect("/unauthorized");
}
```

❌ Never trust client role checks alone

---

## 8. API Routes & Server Actions

### API Routes

```ts
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
}
```

### Server Actions

```ts
"use server";

import { getSession } from "@/lib/get-session";

export async function action() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}
```

---

## 9. Refactoring Checklist (For AI Agent)

The AI **must**:

1. Replace **all** `auth.api.getSession()` calls with `getSession()`
2. Move **all auth checks** to:

   * layouts
   * pages
   * server actions
3. Remove:

   * client redirects
   * auth logic in client components
4. Ensure:

   * one `SessionProvider` at root
   * no nested providers
5. Ensure:

   * `useSession()` only appears in `"use client"` files
6. Replace middleware auth with layout auth unless explicitly required

---

## 10. Golden Architecture

```
lib/get-session.ts        ← cached session
app/layout.tsx            ← session hydration
app/(protected)/layout    ← route guard
server components         ← auth checks
client components         ← UI reactivity only
middleware.ts             ← APIs / admin only
```

---

## 11. Absolute Anti-Patterns (AUTO-FAIL)

❌ `useSession()` in server files
❌ Multiple `SessionProvider`s
❌ Client-side redirects for auth
❌ Fetching session in many places
❌ Middleware for standard pages

---

## 12. Expected Outcomes After Refactor

* 🚀 Faster TTFB
* 🔒 No auth flicker
* 📉 Fewer network calls
* 🧠 Predictable auth logic
* 🤖 AI-friendly, rule-driven architecture
