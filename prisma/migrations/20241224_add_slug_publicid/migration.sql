-- Migration: Add slug and publicId columns for URL-friendly identifiers
-- This migration adds:
-- 1. slug column to Group table (unique, indexed)
-- 2. slug column to Channel table (unique per group, indexed)
-- 3. publicId column to Post table (unique, indexed) - nanoid for short URLs
-- 4. publicId column to Section table (unique, indexed) - nanoid for short URLs

-- ============================================
-- STEP 1: Add columns (nullable initially)
-- ============================================

-- Add slug to Group
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Add slug to Channel
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Add publicId to Post
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "publicId" TEXT;

-- Add publicId to Section
ALTER TABLE "Section" ADD COLUMN IF NOT EXISTS "publicId" TEXT;

-- ============================================
-- STEP 2: Backfill existing data
-- ============================================

-- Backfill Group slugs from name (lowercase, replace spaces/special chars with hyphens)
UPDATE "Group"
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRIM(name),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Handle duplicate group slugs by appending row number
WITH duplicates AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY "createdAt") as rn
  FROM "Group"
  WHERE slug IN (SELECT slug FROM "Group" GROUP BY slug HAVING COUNT(*) > 1)
)
UPDATE "Group" g
SET slug = d.slug || '-' || (d.rn - 1)
FROM duplicates d
WHERE g.id = d.id AND d.rn > 1;

-- Backfill Channel slugs from name
UPDATE "Channel"
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRIM(name),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Handle duplicate channel slugs within same group
WITH duplicates AS (
  SELECT id, slug, "groupId", ROW_NUMBER() OVER (PARTITION BY "groupId", slug ORDER BY "createdAt") as rn
  FROM "Channel"
  WHERE ("groupId", slug) IN (
    SELECT "groupId", slug FROM "Channel" GROUP BY "groupId", slug HAVING COUNT(*) > 1
  )
)
UPDATE "Channel" c
SET slug = d.slug || '-' || (d.rn - 1)
FROM duplicates d
WHERE c.id = d.id AND d.rn > 1;

-- Backfill Post publicIds (use first 10 chars of UUID without hyphens)
UPDATE "Post"
SET "publicId" = SUBSTRING(REPLACE(id::text, '-', ''), 1, 10)
WHERE "publicId" IS NULL;

-- Handle duplicate post publicIds
WITH duplicates AS (
  SELECT id, "publicId", ROW_NUMBER() OVER (PARTITION BY "publicId" ORDER BY "createdAt") as rn
  FROM "Post"
  WHERE "publicId" IN (SELECT "publicId" FROM "Post" GROUP BY "publicId" HAVING COUNT(*) > 1)
)
UPDATE "Post" p
SET "publicId" = SUBSTRING(REPLACE(p.id::text, '-', ''), 1, 8) || LPAD((d.rn)::text, 2, '0')
FROM duplicates d
WHERE p.id = d.id AND d.rn > 1;

-- Backfill Section publicIds
UPDATE "Section"
SET "publicId" = SUBSTRING(REPLACE(id::text, '-', ''), 1, 10)
WHERE "publicId" IS NULL;

-- Handle duplicate section publicIds
WITH duplicates AS (
  SELECT id, "publicId", ROW_NUMBER() OVER (PARTITION BY "publicId" ORDER BY "createdAt") as rn
  FROM "Section"
  WHERE "publicId" IN (SELECT "publicId" FROM "Section" GROUP BY "publicId" HAVING COUNT(*) > 1)
)
UPDATE "Section" s
SET "publicId" = SUBSTRING(REPLACE(s.id::text, '-', ''), 1, 8) || LPAD((d.rn)::text, 2, '0')
FROM duplicates d
WHERE s.id = d.id AND d.rn > 1;

-- ============================================
-- STEP 3: Add indexes for performance
-- ============================================

-- Index on Group.slug
CREATE UNIQUE INDEX IF NOT EXISTS "Group_slug_key" ON "Group"("slug");

-- Index on Channel.slug (unique per group)
CREATE UNIQUE INDEX IF NOT EXISTS "Channel_groupId_slug_key" ON "Channel"("groupId", "slug");

-- Index on Post.publicId
CREATE UNIQUE INDEX IF NOT EXISTS "Post_publicId_key" ON "Post"("publicId");

-- Index on Section.publicId
CREATE UNIQUE INDEX IF NOT EXISTS "Section_publicId_key" ON "Section"("publicId");

-- ============================================
-- STEP 4: Make columns NOT NULL
-- ============================================

ALTER TABLE "Group" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Channel" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Post" ALTER COLUMN "publicId" SET NOT NULL;
ALTER TABLE "Section" ALTER COLUMN "publicId" SET NOT NULL;
