/**
 * ID Utilities for slug and nanoid generation
 * 
 * This module provides utilities for generating:
 * - UUID v7 (time-ordered) for internal database IDs
 * - Slugs for URL-friendly identifiers (groups, channels, courses)
 * - NanoIDs for short public identifiers (posts, sections)
 * 
 * NOTE: This file is client-safe. Server-only functions that need
 * database access are in id-utils.server.ts
 */

import { nanoid } from "nanoid"
import slugify from "slugify"
import { v7 as uuidv7 } from "uuid"

/**
 * Generate a UUID v7 (time-ordered)
 * Benefits over v4:
 * - Time-ordered for better database index performance
 * - Sortable by creation time
 * - Better cache locality in B-tree indexes
 */
export function generateId(): string {
  return uuidv7()
}

/**
 * Generate a URL-friendly slug from a name
 */
export function generateSlug(name: string): string {
  return slugify(name, { 
    lower: true, 
    strict: true,
    trim: true 
  })
}

/**
 * Generate a short public ID using nanoid
 * Used for posts and sections in URLs
 * 10 characters = ~1 trillion unique IDs
 */
export function generatePublicId(): string {
  return nanoid(10)
}

/**
 * Check if a string is a valid UUID (v4 or v7)
 */
export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

/**
 * Check if a string looks like a nanoid (10 chars, URL-safe)
 */
export function isNanoId(str: string): boolean {
  return /^[A-Za-z0-9_-]{10}$/.test(str)
}
