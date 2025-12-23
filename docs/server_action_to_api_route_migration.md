

# Next.js Refactoring Guide: Server Actions vs. API Routes vs. RSC

## 1. Context & Objective

**Current State:** The application currently uses Server Actions for **all** logic, including data fetching (Reads) via custom hooks.
**Goal:** Refactor the codebase to align with Next.js App Router best practices.
**Core Principle:**

* **Server Actions** are strictly for **Mutations** (Writes).
* **Server Components (RSC)** are for **Initial Data Fetching** (Reads).
* **Route Handlers (API Routes)** are for **Client-Side Dynamic Fetching** (Reads on demand).

---

## 2. Decision Matrix: When to use what?

### A. Data Fetching (READ Operations)

| Scenario | Recommended Pattern | Why? |
| --- | --- | --- |
| **Initial Page Load** | **Async Server Component** | Best performance. Zero client-side waterfalls. Access to direct DB. |
| **Search/Filtering (URL based)** | **Async Server Component** | URL search params allow the server to render the correct state initially. |
| **Live/Dynamic Updates** (e.g., polling, live search) | **Route Handler (GET)** + `useSWR` / `react-query` | Client needs to refresh data without reloading the page. |
| **Infinite Scroll** | **Server Actions** (Special Exception) | Can be used to fetch the "next page" of data components (returning JSX). |

**🛑 STRICT RULE:** Do **NOT** use Server Actions for simple data fetching in `useEffect` or standard hooks. It bypasses the GET cache and causes unnecessary POST requests.

### B. Data Mutation (WRITE Operations)

| Scenario | Recommended Pattern | Why? |
| --- | --- | --- |
| **Form Submissions** | **Server Actions** | Progressive enhancement. Handles `FormData` automatically. |
| **Button Clicks** (Like, Delete, Toggle) | **Server Actions** | Easy to invoke from event handlers (`onClick`). |
| **Public Webhooks** (Stripe, etc.) | **Route Handler (POST/GET)** | Need a stable public URL endpoint. |
| **External REST API** | **Route Handler** | If third-party services need to consume your data. |

---

## 3. Implementation Patterns (For AI Agent)

### Pattern 1: Refactoring "Fetch Hook" to Server Component

**❌ BEFORE (Bad Pattern):**
*Fetching data via Server Action inside a Client Component.*

```tsx
// actions.ts
'use server'
export async function getUser(id: string) {
  return db.user.findUnique({ where: { id } });
}

// UserProfile.tsx (Client Component)
'use client'
import { getUser } from './actions';
import { useEffect, useState } from 'react';

export default function UserProfile({ id }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    getUser(id).then(setUser); // ⚠️ Bad: Triggers uncached POST request
  }, [id]);

  if (!user) return <Loading />;
  return <div>{user.name}</div>;
}

```

**✅ AFTER (Good Pattern):**
*Fetch directly in the Server Component.*

```tsx
// UserProfile.tsx (Server Component)
import db from '@/lib/db'; // Direct DB access

export default async function UserProfile({ id }: { id: string }) {
  // ✅ Good: Runs on server, parallelizable, no API overhead
  const user = await db.user.findUnique({ where: { id } });

  return <div>{user.name}</div>;
}

```

---

### Pattern 2: Refactoring "Live Search" to Route Handler

**❌ BEFORE:**
*Using Server Action for search query.*

```tsx
// SearchInput.tsx
'use client'
const handleSearch = async (term) => {
   const results = await searchUsersAction(term); // ⚠️ Bad: POST for search
   setResults(results);
}

```

**✅ AFTER:**
*Using Route Handler + SWR.*

```tsx
// app/api/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('q');
  const results = await db.user.findMany({ ... });
  return Response.json(results);
}

// SearchInput.tsx
'use client'
import useSWR from 'swr';
const fetcher = (url) => fetch(url).then(res => res.json());

export default function SearchInput() {
  const { data } = useSWR(`/api/search?q=${term}`, fetcher); // ✅ Good: Standard GET, Cachable
}

```

---

### Pattern 3: Keeping Server Actions for Forms

**✅ KEEP AS IS:**

```tsx
// actions.ts
'use server'
export async function updateUser(formData: FormData) {
  const name = formData.get('name');
  await db.user.update({ ... });
  revalidatePath('/profile'); // ✅ Crucial for updating UI
}

// FormComponent.tsx
<form action={updateUser}>
  <input name="name" />
  <button type="submit">Save</button>
</form>

```
