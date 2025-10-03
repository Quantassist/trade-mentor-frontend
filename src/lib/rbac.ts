import { GroupRole } from "@prisma/client"

/**
 * RBAC Permission Types
 */
export type Permission =
  | "course:create"
  | "course:edit"
  | "course:delete"
  | "course:publish"
  | "module:create"
  | "module:edit"
  | "module:delete"
  | "section:create"
  | "section:edit"
  | "section:delete"
  | "post:create"
  | "post:edit"
  | "post:delete"
  | "post:moderate"
  | "member:view"
  | "member:invite"
  | "member:remove"
  | "member:change_role"
  | "group:edit"
  | "group:delete"
  | "analytics:view"

/**
 * Role hierarchy and permissions mapping
 */
const ROLE_PERMISSIONS: Record<GroupRole, Permission[]> = {
  OWNER: [
    "course:create",
    "course:edit",
    "course:delete",
    "course:publish",
    "module:create",
    "module:edit",
    "module:delete",
    "section:create",
    "section:edit",
    "section:delete",
    "post:create",
    "post:edit",
    "post:delete",
    "post:moderate",
    "member:view",
    "member:invite",
    "member:remove",
    "member:change_role",
    "group:edit",
    "group:delete",
    "analytics:view",
  ],
  ADMIN: [
    "course:create",
    "course:edit",
    "course:delete",
    "course:publish",
    "module:create",
    "module:edit",
    "module:delete",
    "section:create",
    "section:edit",
    "section:delete",
    "post:create",
    "post:edit",
    "post:delete",
    "post:moderate",
    "member:view",
    "member:invite",
    "member:remove",
    "analytics:view",
  ],
  MODERATOR: [
    "post:create",
    "post:edit",
    "post:delete",
    "post:moderate",
    "member:view",
  ],
  INSTRUCTOR: [
    "course:create",
    "course:edit",
    "module:create",
    "module:edit",
    "section:create",
    "section:edit",
    "post:create",
    "post:edit",
  ],
  MEMBER: ["post:create", "post:edit"],
}

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (
  role: GroupRole | null | undefined,
  permission: Permission,
): boolean => {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Check if user can manage courses (create, edit, delete)
 */
export const canManageCourses = (
  role: GroupRole | null | undefined,
  isSuperAdmin: boolean = false,
): boolean => {
  if (isSuperAdmin) return true
  if (!role) return false
  return (
    role === "OWNER" || role === "ADMIN" || role === "INSTRUCTOR"
  )
}

/**
 * Check if user can create courses
 */
export const canCreateCourse = (
  role: GroupRole | null | undefined,
  isSuperAdmin: boolean = false,
): boolean => {
  if (isSuperAdmin) return true
  // Restrict to superadmins, group owners, and group admins only
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Check if user can publish/unpublish courses
 */
export const canPublishCourse = (
  role: GroupRole | null | undefined,
  isSuperAdmin: boolean = false,
): boolean => {
  if (isSuperAdmin) return true
  return hasPermission(role, "course:publish")
}

/**
 * Check if user can moderate content
 */
export const canModerateContent = (
  role: GroupRole | null | undefined,
  isSuperAdmin: boolean = false,
): boolean => {
  if (isSuperAdmin) return true
  return hasPermission(role, "post:moderate")
}

/**
 * Check if user can manage members
 */
export const canManageMembers = (
  role: GroupRole | null | undefined,
  isSuperAdmin: boolean = false,
): boolean => {
  if (isSuperAdmin) return true
  return hasPermission(role, "member:remove")
}

/**
 * Check if user can view analytics
 */
export const canViewAnalytics = (
  role: GroupRole | null | undefined,
  isSuperAdmin: boolean = false,
): boolean => {
  if (isSuperAdmin) return true
  return hasPermission(role, "analytics:view")
}

/**
 * Check if user is group owner
 */
export const isGroupOwner = (role: GroupRole | null | undefined): boolean => {
  return role === "OWNER"
}

/**
 * Check if user is admin or higher
 */
export const isAdminOrHigher = (
  role: GroupRole | null | undefined,
): boolean => {
  return role === "OWNER" || role === "ADMIN"
}

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: GroupRole): Permission[] => {
  return ROLE_PERMISSIONS[role] ?? []
}
