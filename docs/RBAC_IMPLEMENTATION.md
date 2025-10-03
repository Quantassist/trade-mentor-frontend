# RBAC Implementation Guide

## Overview
This document describes the Role-Based Access Control (RBAC) implementation for course management in the Trade Mentor application.

## Database Schema Changes

### User Model
Added `isSuperAdmin` field to identify platform-wide administrators:
```prisma
model User {
  isSuperAdmin Boolean @default(false)
  // ... other fields
}
```

### Members Model
Added `role` field with GroupRole enum:
```prisma
model Members {
  role GroupRole @default(MEMBER)
  // ... other fields
}
```

### GroupRole Enum
```prisma
enum GroupRole {
  OWNER       // Group creator, full permissions
  ADMIN       // Can manage courses, members, content
  MODERATOR   // Can moderate posts and view members
  INSTRUCTOR  // Can create and edit courses
  MEMBER      // Basic member, can create posts
}
```

## Required Database Migration

**IMPORTANT**: Before running the application, you must:

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Create and run migration**:
   ```bash
   npx prisma migrate dev --name add_rbac_fields
   ```

   Or if you're using a production database:
   ```bash
   npx prisma migrate deploy
   ```

## Implementation Details

### 1. RBAC Utilities (`src/lib/rbac.ts`)
Created comprehensive permission checking functions:
- `hasPermission()` - Check if role has specific permission
- `canCreateCourse()` - Check course creation permission
- `canPublishCourse()` - Check course publish permission
- `canManageCourses()` - Check course management permission
- `canModerateContent()` - Check content moderation permission
- `canManageMembers()` - Check member management permission
- `canViewAnalytics()` - Check analytics viewing permission
- `isGroupOwner()` - Check if user is group owner
- `isAdminOrHigher()` - Check if user is admin or owner

### 2. Auth Actions (`src/actions/auth.ts`)
Updated authentication actions:
- `onAuthenticatedUser()` - Now returns `isSuperAdmin` flag
- `onGetUserGroupRole()` - New function to get user's role in a specific group

### 3. Course Management

#### Courses Page (`src/app/[locale]/group/[groupid]/courses/page.tsx`)
- Checks user permissions before rendering
- Only shows `CourseCreate` component to users with `course:create` permission
- Super admins, group owners, admins, and instructors can create courses

#### Course Actions (`src/actions/courses.ts`)
- `onCreateGroupCourse()` - Added permission checks
- Returns 401 if user is not a group member
- Returns 403 if user lacks course creation permission

## Permission Matrix

| Permission | OWNER | ADMIN | MODERATOR | INSTRUCTOR | MEMBER |
|------------|-------|-------|-----------|------------|--------|
| course:create | ✅ | ✅ | ❌ | ✅ | ❌ |
| course:edit | ✅ | ✅ | ❌ | ✅ | ❌ |
| course:delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| course:publish | ✅ | ✅ | ❌ | ❌ | ❌ |
| module:create | ✅ | ✅ | ❌ | ✅ | ❌ |
| module:edit | ✅ | ✅ | ❌ | ✅ | ❌ |
| module:delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| section:create | ✅ | ✅ | ❌ | ✅ | ❌ |
| section:edit | ✅ | ✅ | ❌ | ✅ | ❌ |
| section:delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| post:create | ✅ | ✅ | ✅ | ✅ | ✅ |
| post:edit | ✅ | ✅ | ✅ | ✅ | ✅ |
| post:delete | ✅ | ✅ | ✅ | ❌ | ❌ |
| post:moderate | ✅ | ✅ | ✅ | ❌ | ❌ |
| member:view | ✅ | ✅ | ✅ | ❌ | ❌ |
| member:invite | ✅ | ✅ | ❌ | ❌ | ❌ |
| member:remove | ✅ | ✅ | ❌ | ❌ | ❌ |
| member:change_role | ✅ | ❌ | ❌ | ❌ | ❌ |
| group:edit | ✅ | ❌ | ❌ | ❌ | ❌ |
| group:delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| analytics:view | ✅ | ✅ | ❌ | ❌ | ❌ |

**Note**: Super admins have all permissions across all groups.

## Next Steps

### Immediate Tasks
1. Run database migration (see above)
2. Test course creation with different roles
3. Verify permission checks are working

### Additional Features to Implement

#### 1. Module & Section Management
Add RBAC to:
- `onCreateCourseModule()` - Check `module:create` permission
- `onUpdateModule()` - Check `module:edit` permission
- `onDeleteModule()` - Check `module:delete` permission
- `onCreateModuleSection()` - Check `section:create` permission
- `onUpdateSection()` - Check `section:edit` permission
- `onDeleteSection()` - Check `section:delete` permission

#### 2. Post Management
Add RBAC to post-related actions:
- Create post - Check `post:create` permission
- Edit post - Check `post:edit` permission
- Delete post - Check `post:delete` permission
- Moderate post - Check `post:moderate` permission

#### 3. Member Management
Create new actions with RBAC:
- View members list - Check `member:view` permission
- Invite members - Check `member:invite` permission
- Remove members - Check `member:remove` permission
- Change member role - Check `member:change_role` permission

#### 4. Group Management
Add RBAC to group settings:
- Edit group details - Check `group:edit` permission
- Delete group - Check `group:delete` permission

#### 5. Analytics Dashboard
Create analytics page with RBAC:
- View analytics - Check `analytics:view` permission
- Display user progress, engagement metrics

#### 6. Content Moderation
Create moderation interface:
- Approve/reject posts
- Manage comments
- Handle reported content

#### 7. Super Admin Features
Create super admin dashboard:
- User management (suspend, delete accounts)
- Platform-wide analytics
- System configuration
- Affiliate and payment management

## Usage Examples

### Check Permission in Server Component
```typescript
import { onGetUserGroupRole } from "@/actions/auth"
import { canCreateCourse } from "@/lib/rbac"

const MyPage = async ({ params }) => {
  const userRole = await onGetUserGroupRole(params.groupid)
  const canCreate = userRole.status === 200 && 
    canCreateCourse(userRole.role, userRole.isSuperAdmin)
  
  return (
    <div>
      {canCreate && <CreateButton />}
    </div>
  )
}
```

### Check Permission in Server Action
```typescript
import { onGetUserGroupRole } from "@/actions/auth"
import { hasPermission } from "@/lib/rbac"

export const onUpdateCourse = async (groupId: string, courseId: string) => {
  const userRole = await onGetUserGroupRole(groupId)
  
  if (userRole.status !== 200) {
    return { status: 401, message: "Unauthorized" }
  }
  
  if (!hasPermission(userRole.role, "course:edit") && !userRole.isSuperAdmin) {
    return { status: 403, message: "Forbidden" }
  }
  
  // Proceed with update...
}
```

### Assign Role to Member
```typescript
// When adding a member to a group
await client.members.create({
  data: {
    userId: userId,
    groupId: groupId,
    role: "MEMBER", // or "INSTRUCTOR", "MODERATOR", "ADMIN"
  },
})
```

### Set Super Admin
```typescript
// Manually set a user as super admin (should be done via admin interface)
await client.user.update({
  where: { id: userId },
  data: { isSuperAdmin: true },
})
```

## Security Considerations

1. **Always check permissions server-side** - Never rely solely on client-side checks
2. **Super admin flag** should only be set through secure admin interface
3. **Group owner** is automatically determined by the `Group.userId` field
4. **Role hierarchy** - Higher roles don't automatically inherit lower role permissions; use the permission matrix
5. **Audit logging** - Consider adding audit logs for sensitive operations

## Testing Checklist

- [ ] Super admin can create courses in any group
- [ ] Group owner can create courses
- [ ] Group admin can create courses
- [ ] Instructor can create courses
- [ ] Moderator cannot create courses
- [ ] Regular member cannot create courses
- [ ] Non-members cannot create courses
- [ ] CourseCreate component only shows for authorized users
- [ ] Unauthorized course creation attempts are blocked server-side
- [ ] Appropriate error messages are shown

## Migration Rollback

If you need to rollback the migration:
```bash
npx prisma migrate resolve --rolled-back <migration-name>
```

Then manually remove the added fields from the schema.
