# UUID to Slug/NanoID Migration Plan

## Overview

This document outlines the detailed migration plan to convert URLs from UUID-based to slug/nanoid-based for better readability and shareability.

### Current URL Structure
```
/group/ba61df39-0f50-41cd-85fa-215a0376b2eb/feed/790595da-6058-43b2-b8a5-2a0a707abeec/45bd6ddd-a3d2-4d1d-a8ee-0d11834c1695
/group/ba61df39-0f50-41cd-85fa-215a0376b2eb/courses/88e2fdfb-6c6c-43b1-a454-ccce3891ecb2/42bcfe4b-85e2-4540-b8c3-a9886cd30c42
```

### Target URL Structure
```
/group/technical-analysis/feed/announcements/Xy7z9AbC
/group/technical-analysis/courses/intro-to-trading/Xy7z9AbC
```

---

## Database Schema Analysis

### Current State

| Table | Primary Key | Has Slug | Needs Slug | Needs NanoID |
|-------|-------------|----------|------------|--------------|
| `Group` | UUID | ❌ No | ✅ Yes | ❌ No |
| `Channel` | UUID | ❌ No | ✅ Yes | ❌ No |
| `Post` | UUID | ❌ No | ❌ No | ✅ Yes (publicId) |
| `Course` | UUID | ✅ Yes | ✅ Already has | ❌ No |
| `Module` | UUID | ✅ Yes (optional) | ❌ No | ❌ No |
| `Section` | UUID | ❌ No | ❌ No | ✅ Yes (publicId) |

### Schema Changes Required

#### 1. Group Table - Add `slug` column
```prisma
model Group {
  id              String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name            String             @unique
  slug            String             @unique  // NEW: URL-friendly identifier
  // ... rest unchanged
}
```

#### 2. Channel Table - Add `slug` column
```prisma
model Channel {
  id        String   @id @db.Uuid
  name      String
  slug      String   // NEW: URL-friendly identifier (unique within group)
  // ... rest unchanged
  
  @@unique([groupId, slug])  // Slug unique per group
}
```

#### 3. Post Table - Add `publicId` column (NanoID)
```prisma
model Post {
  id           String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  publicId     String            @unique  // NEW: Short URL-friendly ID (nanoid)
  // ... rest unchanged
}
```

#### 4. Section Table - Add `publicId` column (NanoID)
```prisma
model Section {
  id           String                   @id @db.Uuid
  publicId     String                   @unique  // NEW: Short URL-friendly ID (nanoid)
  // ... rest unchanged
}
```

---

## Migration Phases

### Phase 1: Database Schema Migration

#### Step 1.1: Install Dependencies
```bash
bun add slugify nanoid
```

#### Step 1.2: Create Utility Functions
Create `src/lib/id-utils.ts`:
```typescript
import slugify from 'slugify'
import { nanoid } from 'nanoid'
import { client } from '@/lib/prisma'

// Generate URL-friendly slug from name
export function generateSlug(name: string): string {
  return slugify(name, { lower: true, strict: true })
}

// Generate unique slug for groups
export async function generateUniqueGroupSlug(name: string): Promise<string> {
  let slug = generateSlug(name)
  let count = 0
  
  while (true) {
    const attemptedSlug = count === 0 ? slug : `${slug}-${count}`
    const existing = await client.group.findFirst({
      where: { slug: attemptedSlug }
    })
    if (!existing) return attemptedSlug
    count++
  }
}

// Generate unique slug for channels within a group
export async function generateUniqueChannelSlug(name: string, groupId: string): Promise<string> {
  let slug = generateSlug(name)
  let count = 0
  
  while (true) {
    const attemptedSlug = count === 0 ? slug : `${slug}-${count}`
    const existing = await client.channel.findFirst({
      where: { slug: attemptedSlug, groupId }
    })
    if (!existing) return attemptedSlug
    count++
  }
}

// Generate short public ID (10 chars, URL-safe)
export function generatePublicId(): string {
  return nanoid(10)
}
```

#### Step 1.3: Prisma Schema Updates
Update `prisma/schema.prisma`:

```prisma
model Group {
  // Add after 'name'
  slug            String?            @unique  // Initially nullable for migration
}

model Channel {
  // Add after 'name'
  slug      String?
  
  // Add unique constraint
  @@unique([groupId, slug])
}

model Post {
  // Add after 'id'
  publicId     String?            @unique
}

model Section {
  // Add after 'id'
  publicId     String?            @unique
}
```

#### Step 1.4: Database Migration SQL
```sql
-- Migration: add_slug_and_publicid_columns

-- 1. Add slug column to Group
ALTER TABLE "Group" ADD COLUMN "slug" TEXT;

-- 2. Add slug column to Channel  
ALTER TABLE "Channel" ADD COLUMN "slug" TEXT;

-- 3. Add publicId column to Post
ALTER TABLE "Post" ADD COLUMN "publicId" TEXT;

-- 4. Add publicId column to Section
ALTER TABLE "Section" ADD COLUMN "publicId" TEXT;

-- 5. Backfill Group slugs from name
UPDATE "Group" 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- 6. Backfill Channel slugs from name
UPDATE "Channel"
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- 7. Backfill Post publicIds (use first 10 chars of UUID as temporary)
UPDATE "Post"
SET "publicId" = SUBSTRING(REPLACE(id::text, '-', ''), 1, 10)
WHERE "publicId" IS NULL;

-- 8. Backfill Section publicIds
UPDATE "Section"
SET "publicId" = SUBSTRING(REPLACE(id::text, '-', ''), 1, 10)
WHERE "publicId" IS NULL;

-- 9. Add unique constraints
CREATE UNIQUE INDEX "Group_slug_key" ON "Group"("slug");
CREATE UNIQUE INDEX "Channel_groupId_slug_key" ON "Channel"("groupId", "slug");
CREATE UNIQUE INDEX "Post_publicId_key" ON "Post"("publicId");
CREATE UNIQUE INDEX "Section_publicId_key" ON "Section"("publicId");

-- 10. Make columns NOT NULL after backfill
ALTER TABLE "Group" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Channel" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Post" ALTER COLUMN "publicId" SET NOT NULL;
ALTER TABLE "Section" ALTER COLUMN "publicId" SET NOT NULL;
```

---

### Phase 2: Server Action Updates

#### Files to Update for Entity Creation

| File | Function | Change |
|------|----------|--------|
| `src/actions/groups.ts` | `onCreateNewGroup` | Generate slug from name |
| `src/actions/channel.ts` | `onCreateNewChannel` | Generate slug from name |
| `src/actions/channel.ts` | `onCreateChannelPost` | Generate publicId (nanoid) |
| `src/actions/channel.ts` | `onCreateChannelPostMulti` | Generate publicId (nanoid) |
| `src/actions/courses.ts` | `onCreateModuleSection` | Generate publicId (nanoid) |

#### 2.1 Update Group Creation (`src/actions/groups.ts`)
```typescript
// In onCreateNewGroup
import { generateUniqueGroupSlug } from '@/lib/id-utils'

const slug = await generateUniqueGroupSlug(data.name)
// Add slug to create data
```

#### 2.2 Update Channel Creation (`src/actions/channel.ts`)
```typescript
// In onCreateNewChannel
import { generateUniqueChannelSlug } from '@/lib/id-utils'

const slug = await generateUniqueChannelSlug(data.name, groupid)
// Add slug to create data
```

#### 2.3 Update Post Creation (`src/actions/channel.ts`)
```typescript
// In onCreateChannelPost and onCreateChannelPostMulti
import { generatePublicId } from '@/lib/id-utils'

const publicId = generatePublicId()
// Add publicId to create data
```

#### 2.4 Update Section Creation (`src/actions/courses.ts`)
```typescript
// In onCreateModuleSection
import { generatePublicId } from '@/lib/id-utils'

const publicId = generatePublicId()
// Add publicId to create data
```

---

### Phase 3: Data Layer Updates

#### Files to Update for Lookups

| File | Function | Change |
|------|----------|--------|
| `src/data/groups.ts` | `getGroupInfo` | Accept slug OR id, lookup by slug |
| `src/data/channels.ts` | `getChannelInfo` | Accept slug OR id, lookup by slug |
| `src/data/groups.ts` | `getPostInfo` | Accept publicId OR id |
| `src/data/courses.ts` | `getSectionInfo` | Accept publicId OR id |

#### 3.1 Update Group Lookup
```typescript
// src/data/groups.ts
export const getGroupInfo = cache(async (groupIdOrSlug: string, locale?: string, userId?: string) => {
  // Check if it's a UUID or slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupIdOrSlug)
  
  const group = await client.group.findFirst({
    where: isUUID ? { id: groupIdOrSlug } : { slug: groupIdOrSlug },
  })
  // ... rest unchanged
})
```

#### 3.2 Update Channel Lookup
```typescript
// src/data/channels.ts
export const getChannelInfo = cache(async (
  channelIdOrSlug: string, 
  groupIdOrSlug?: string,  // Need group context for slug lookup
  locale?: string, 
  userId?: string | null
) => {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(channelIdOrSlug)
  
  let channel
  if (isUUID) {
    channel = await client.channel.findUnique({ where: { id: channelIdOrSlug } })
  } else {
    // Need to resolve group first
    const group = await resolveGroup(groupIdOrSlug!)
    channel = await client.channel.findFirst({ 
      where: { slug: channelIdOrSlug, groupId: group.id } 
    })
  }
  // ... rest unchanged
})
```

---

### Phase 4: Route Structure Updates

#### Current Route Structure
```
src/app/[locale]/group/[groupid]/
├── layout.tsx
├── feed/
│   ├── [channelid]/
│   │   ├── page.tsx
│   │   └── [postid]/
│   │       └── page.tsx
└── courses/
    └── [courseid]/
        ├── layout.tsx
        ├── page.tsx
        └── [sectionid]/
            └── page.tsx
```

#### New Route Structure (Rename folders)
```
src/app/[locale]/group/[groupSlug]/           # Renamed from [groupid]
├── layout.tsx
├── feed/
│   ├── [channelSlug]/                        # Renamed from [channelid]
│   │   ├── page.tsx
│   │   └── [postId]/                         # Keep as [postId] but use publicId
│   │       └── page.tsx
└── courses/
    └── [courseSlug]/                         # Renamed from [courseid]
        ├── layout.tsx
        ├── page.tsx
        └── [sectionId]/                      # Keep as [sectionId] but use publicId
            └── page.tsx
```

#### Files to Update (params extraction)

| File | Current Param | New Param |
|------|---------------|-----------|
| `src/app/[locale]/group/[groupid]/layout.tsx` | `groupid` | `groupSlug` |
| `src/app/[locale]/group/[groupid]/feed/[channelid]/page.tsx` | `channelid` | `channelSlug` |
| `src/app/[locale]/group/[groupid]/feed/[channelid]/[postid]/page.tsx` | `postid` | `postId` (publicId) |
| `src/app/[locale]/group/[groupid]/courses/[courseid]/layout.tsx` | `courseid` | `courseSlug` |
| `src/app/[locale]/group/[groupid]/courses/[courseid]/[sectionid]/layout.tsx` | `sectionid` | `sectionId` (publicId) |

---

### Phase 5: Client-Side Updates

#### 5.1 Update ID Generation in Hooks

| File | Current | New |
|------|---------|-----|
| `src/hooks/channels/index.ts` | `v4()` for postid | `generatePublicId()` |
| `src/hooks/courses/index.ts` | `v4()` for sectionid | `generatePublicId()` |
| `src/components/global/sidebar/index.tsx` | `uuidv4()` for channel id | Keep UUID for internal ID, add slug generation |

#### 5.2 Update Link Generation

All links that reference entities need to use slugs/publicIds:

```typescript
// Before
<Link href={`/group/${groupid}/feed/${channelid}`}>

// After  
<Link href={`/group/${groupSlug}/feed/${channelSlug}`}>
```

Files with links to update:
- `src/components/global/sidebar/menu.tsx`
- `src/app/[locale]/group/_components/mobile-channels.tsx`
- `src/app/[locale]/group/[groupid]/feed/[channelid]/_components/post-feed/index.tsx`
- `src/app/[locale]/group/[groupid]/courses/_components/course-card.tsx`
- And many more...

---

## Implementation Order

### Step-by-Step Execution

1. **Install dependencies**
   ```bash
   bun add slugify nanoid
   ```

2. **Create utility functions** (`src/lib/id-utils.ts`)

3. **Update Prisma schema** (add nullable columns first)

4. **Run database migration** (add columns + backfill)

5. **Update Prisma schema** (make columns required)

6. **Update server actions** (entity creation)

7. **Update data layer** (lookups)

8. **Rename route folders** (one at a time, test each)

9. **Update all Link components** (use new slugs)

10. **Update client hooks** (ID generation)

---

## Risk Mitigation

### Backward Compatibility
- Keep UUID lookups working alongside slug lookups
- Data layer functions should accept both UUID and slug
- Old URLs should redirect to new URLs (optional, via middleware)

### Data Integrity
- Slugs must be unique (enforced at DB level)
- PublicIds must be unique (enforced at DB level)
- Backfill script handles duplicates by appending numbers

### Testing Checklist
- [ ] Group creation generates slug
- [ ] Channel creation generates slug
- [ ] Post creation generates publicId
- [ ] Section creation generates publicId
- [ ] Group lookup by slug works
- [ ] Channel lookup by slug works
- [ ] Post lookup by publicId works
- [ ] Section lookup by publicId works
- [ ] All navigation links use new format
- [ ] Existing data accessible via new URLs

---

## Questions for Review

1. **Slug format preference**: Should slugs allow numbers? (e.g., `trading-101` vs `trading`)

2. **PublicId length**: 10 characters provides ~1 trillion unique IDs. Is this sufficient?

3. **Old URL handling**: Should we implement redirects from old UUID URLs to new slug URLs?

4. **Course slug**: Course already has `slug` column - should we use it in URLs or keep `courseid`?

5. **Module in URL**: Currently sections are accessed via `/courses/[courseid]/[sectionid]`. Should modules be in the URL path?
