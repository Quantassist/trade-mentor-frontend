/**
 * Server-only ID Utilities
 * 
 * These functions require database access and can only be used in server components
 * and server actions. For client-safe utilities, use id-utils.ts
 */

import { client } from "@/lib/prisma"
import { generateSlug } from "./id-utils"

/**
 * Generate a unique slug for groups
 * Handles duplicates by appending numbers
 */
export async function generateUniqueGroupSlug(name: string): Promise<string> {
  const baseSlug = generateSlug(name)
  let slug = baseSlug
  let count = 0

  while (true) {
    const existing = await client.group.findFirst({
      where: { slug },
      select: { id: true },
    })
    if (!existing) return slug
    count++
    slug = `${baseSlug}-${count}`
  }
}

/**
 * Generate a unique slug for channels within a group
 * Slugs are unique per group, not globally
 */
export async function generateUniqueChannelSlug(
  name: string,
  groupId: string
): Promise<string> {
  const baseSlug = generateSlug(name)
  let slug = baseSlug
  let count = 0

  while (true) {
    const existing = await client.channel.findFirst({
      where: { slug, groupId },
      select: { id: true },
    })
    if (!existing) return slug
    count++
    slug = `${baseSlug}-${count}`
  }
}
