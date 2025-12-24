/**
 * API Helper - Type-safe API client for TanStack Query
 * Combines endpoints with the fetch client for a clean API
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"

// Re-export for convenience
export { apiClient, ApiError } from "./client"
export { API_ENDPOINTS } from "./endpoints"

// Type definitions for API responses (matching server action return types)
export type GroupInfoResponse = {
  status: number
  group?: any
  groupOwner?: boolean
  isSuperAdmin?: boolean
  role?: string
  message?: string
}

export type GroupCoursesResponse = {
  status: number
  courses?: any[]
  message?: string
}

export type CourseModulesResponse = {
  status: number
  modules?: any[]
  message?: string
}

export type SectionInfoResponse = {
  status: number
  section?: any
  user?: any
  message?: string
}

export type ChannelInfoResponse = {
  status: number
  channel?: any
  posts?: any[]
  message?: string
}

export type PostInfoResponse = {
  status: number
  post?: any
  message?: string
}

export type GroupEventsResponse = {
  status: number
  events?: any[]
  message?: string
}

export type LeaderboardResponse = {
  status: number
  leaderboard?: any[]
  message?: string
}

export type UserRankResponse = {
  status: number
  rank?: number
  points?: number
  message?: string
}

export type MentorProfilesResponse = {
  status: number
  mentors?: any[]
  message?: string
}

export type ModuleAnchorsResponse = {
  status: number
  anchors?: any[]
  message?: string
}

export type ChannelPostsResponse = {
  status: number
  posts?: any[]
  message?: string
}

export type OngoingCoursesResponse = {
  status: number
  courses?: any[]
  message?: string
}

export type PostCommentsResponse = {
  status: number
  comments?: any[]
  message?: string
}

export type CommentRepliesResponse = {
  status: number
  replies?: any[]
  message?: string
}

export type UserGroupsResponse = {
  status: number
  groups?: any[]
  members?: any[]
  message?: string
}

export type ExploreGroupsResponse = {
  status: number
  groups?: any[]
  message?: string
}

export type SearchGroupsResponse = {
  status: number
  groups?: any[]
  message?: string
}

export type GroupMembersResponse = {
  status: number
  members?: any[]
  message?: string
}

export type GroupMentorsResponse = {
  status: number
  mentors?: any[]
  message?: string
}

export type DomainConfigResponse = {
  status: any
  domain?: string
  message?: string
}

export type GroupSubscriptionResponse = {
  status: number
  subscription?: any[]
  count?: number
  message?: string
}

export type GroupSubscriptionsResponse = {
  status: number
  subscriptions?: any[]
  count?: number
  message?: string
}

export type AffiliateInfoResponse = {
  status: number
  user?: any
  affiliate?: any
  message?: string
}

export type UserRoleResponse = {
  status: number
  role?: string
  isSuperAdmin?: boolean
  isOwner?: boolean
  message?: string
}

export type PostAllLocalesResponse = {
  status: number
  post?: any
  message?: string
}

export type EventByIdResponse = {
  status: number
  event?: any
  message?: string
}

export type EventRegistrationResponse = {
  status: number
  registered?: boolean
  message?: string
}

export type UserPointActivitiesResponse = {
  status: number
  activities?: any[]
  message?: string
}

export type ActiveSubscriptionResponse = {
  status: number
  subscription?: any
  message?: string
}

export type StripeIntegrationResponse = {
  status: number
  integration?: any
  message?: string
}

/**
 * API Helper object - use this in hooks for data fetching
 * Each method returns a promise that resolves to the API response
 */
export const api = {
  // Groups
  groups: {
    getInfo: (groupId: string, locale?: string) =>
      apiClient.get<GroupInfoResponse>(API_ENDPOINTS.groups.info(groupId), { locale }),

    getCourses: (groupId: string, filter?: string, locale?: string) =>
      apiClient.get<GroupCoursesResponse>(API_ENDPOINTS.groups.courses(groupId), { filter, locale }),

    getChannels: (groupId: string, locale?: string) =>
      apiClient.get<ChannelInfoResponse>(API_ENDPOINTS.groups.channels(groupId), { locale }),

    getEvents: (groupId: string) =>
      apiClient.get<GroupEventsResponse>(API_ENDPOINTS.groups.events(groupId)),

    getLeaderboard: (groupId: string, limit?: number) =>
      apiClient.get<LeaderboardResponse>(API_ENDPOINTS.groups.leaderboard(groupId), { limit }),

    getMembers: (groupId: string) =>
      apiClient.get<GroupMembersResponse>(API_ENDPOINTS.groups.members(groupId)),

    getMentors: (groupId: string) =>
      apiClient.get<GroupMentorsResponse>(API_ENDPOINTS.groups.mentors(groupId)),

    getSubscription: (groupId: string) =>
      apiClient.get<GroupSubscriptionResponse>(API_ENDPOINTS.groups.subscription(groupId)),

    getSubscriptions: (groupId: string) =>
      apiClient.get<GroupSubscriptionsResponse>(API_ENDPOINTS.groups.subscriptions(groupId)),

    getDomain: (groupId: string) =>
      apiClient.get<DomainConfigResponse>(API_ENDPOINTS.groups.domain(groupId)),

    explore: (category: string, paginate?: number) =>
      apiClient.get<ExploreGroupsResponse>(API_ENDPOINTS.groups.explore(), { category, paginate }),

    search: (mode: string, query: string, paginate?: number) =>
      apiClient.get<SearchGroupsResponse>(API_ENDPOINTS.groups.search(), { mode, query, paginate }),

    getUserGroups: (userId?: string) =>
      apiClient.get<UserGroupsResponse>(API_ENDPOINTS.groups.userGroups(), { userId }),

    getAffiliate: (groupId: string) =>
      apiClient.get<AffiliateInfoResponse>(API_ENDPOINTS.groups.affiliate(groupId)),

    getAffiliateInfo: (affiliateId: string) =>
      apiClient.get<AffiliateInfoResponse>(`/api/affiliates/${affiliateId}`),

    verifyAffiliate: (affiliateId: string) =>
      apiClient.get<{ status: number }>(`/api/affiliates/${affiliateId}/verify`),
  },

  // Courses
  courses: {
    getModules: (courseId: string) =>
      apiClient.get<CourseModulesResponse>(API_ENDPOINTS.courses.modules(courseId)),

    getAbout: (courseId: string, locale?: string) =>
      apiClient.get<any>(API_ENDPOINTS.courses.about(courseId), { locale }),

    getMentorProfiles: () =>
      apiClient.get<MentorProfilesResponse>(API_ENDPOINTS.courses.mentors()),

    getOngoing: (limit?: number) =>
      apiClient.get<OngoingCoursesResponse>(API_ENDPOINTS.courses.ongoing(), { limit }),
  },

  // Sections
  sections: {
    getInfo: (sectionId: string, locale?: string) =>
      apiClient.get<SectionInfoResponse>(API_ENDPOINTS.sections.info(sectionId), { locale }),

    getAnchors: (moduleId: string, locale?: string) =>
      apiClient.get<ModuleAnchorsResponse>(API_ENDPOINTS.sections.anchors(moduleId), { locale }),
  },

  // Channels
  channels: {
    getInfo: (channelId: string, locale?: string, groupId?: string) =>
      apiClient.get<ChannelInfoResponse>(API_ENDPOINTS.channels.info(channelId), { locale, groupId }),

    getPosts: (channelId: string, locale?: string, groupId?: string) =>
      apiClient.get<ChannelPostsResponse>(API_ENDPOINTS.channels.posts(channelId), { locale, groupId }),
  },

  // Posts
  posts: {
    getInfo: (postId: string, locale?: string) =>
      apiClient.get<PostInfoResponse>(API_ENDPOINTS.posts.info(postId), { locale }),

    getAllLocales: (postId: string) =>
      apiClient.get<PostAllLocalesResponse>(API_ENDPOINTS.posts.allLocales(postId)),

    getComments: (postId: string, userId?: string) =>
      apiClient.get<PostCommentsResponse>(API_ENDPOINTS.posts.comments(postId), { userId }),

    getClaps: (postId: string) =>
      apiClient.get<any>(API_ENDPOINTS.posts.claps(postId)),
  },

  // Comments
  comments: {
    getReplies: (commentId: string) =>
      apiClient.get<CommentRepliesResponse>(API_ENDPOINTS.comments.replies(commentId)),

    getClaps: (commentId: string) =>
      apiClient.get<any>(API_ENDPOINTS.comments.claps(commentId)),
  },

  // Events
  events: {
    getById: (eventId: string) =>
      apiClient.get<EventByIdResponse>(API_ENDPOINTS.events.byId(eventId)),

    getRegistration: (eventId: string) =>
      apiClient.get<EventRegistrationResponse>(API_ENDPOINTS.events.registration(eventId)),
  },

  // Leaderboard
  leaderboard: {
    getUserRank: (groupId: string) =>
      apiClient.get<UserRankResponse>(API_ENDPOINTS.leaderboard.userRank(groupId)),

    getUserActivities: (groupId: string, limit?: number) =>
      apiClient.get<UserPointActivitiesResponse>(API_ENDPOINTS.leaderboard.userActivities(groupId), { limit }),
  },

  // Payments
  payments: {
    getActiveSubscription: (groupId: string) =>
      apiClient.get<ActiveSubscriptionResponse>(API_ENDPOINTS.payments.activeSubscription(groupId)),

    getStripeIntegration: (groupId: string) =>
      apiClient.get<StripeIntegrationResponse>(API_ENDPOINTS.payments.stripeIntegration(groupId)),
  },

  // Auth
  auth: {
    getUser: () =>
      apiClient.get<any>(API_ENDPOINTS.auth.user()),

    getRole: (groupId: string) =>
      apiClient.get<UserRoleResponse>(API_ENDPOINTS.auth.role(groupId)),
  },
}
