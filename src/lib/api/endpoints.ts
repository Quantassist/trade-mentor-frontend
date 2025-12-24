/**
 * Centralized API endpoint definitions
 * All API routes are defined here for easy maintenance
 */

export const API_ENDPOINTS = {
  // Groups
  groups: {
    info: (groupId: string) => `/api/groups/${groupId}/info`,
    courses: (groupId: string) => `/api/groups/${groupId}/courses`,
    channels: (groupId: string) => `/api/groups/${groupId}/channels`,
    events: (groupId: string) => `/api/groups/${groupId}/events`,
    leaderboard: (groupId: string) => `/api/groups/${groupId}/leaderboard`,
    members: (groupId: string) => `/api/groups/${groupId}/members`,
    mentors: (groupId: string) => `/api/groups/${groupId}/mentors`,
    subscription: (groupId: string) => `/api/groups/${groupId}/subscription`,
    subscriptions: (groupId: string) => `/api/groups/${groupId}/subscriptions`,
    domain: (groupId: string) => `/api/groups/${groupId}/domain`,
    explore: () => `/api/groups/explore`,
    search: () => `/api/groups/search`,
    userGroups: () => `/api/groups/user`,
    affiliate: (groupId: string) => `/api/groups/${groupId}/affiliate`,
  },

  // Courses
  courses: {
    modules: (courseId: string) => `/api/courses/${courseId}/modules`,
    about: (courseId: string) => `/api/courses/${courseId}/about`,
    mentors: () => `/api/courses/mentors`,
    ongoing: () => `/api/courses/ongoing`,
  },

  // Sections
  sections: {
    info: (sectionId: string) => `/api/sections/${sectionId}`,
    anchors: (moduleId: string) => `/api/modules/${moduleId}/anchors`,
  },

  // Channels
  channels: {
    info: (channelId: string) => `/api/channels/${channelId}`,
    posts: (channelId: string) => `/api/channels/${channelId}/posts`,
  },

  // Posts
  posts: {
    info: (postId: string) => `/api/posts/${postId}`,
    allLocales: (postId: string) => `/api/posts/${postId}/locales`,
    comments: (postId: string) => `/api/posts/${postId}/comments`,
    claps: (postId: string) => `/api/posts/${postId}/claps`,
  },

  // Comments
  comments: {
    replies: (commentId: string) => `/api/comments/${commentId}/replies`,
    claps: (commentId: string) => `/api/comments/${commentId}/claps`,
  },

  // Events
  events: {
    byId: (eventId: string) => `/api/events/${eventId}`,
    registration: (eventId: string) => `/api/events/${eventId}/registration`,
  },

  // Leaderboard
  leaderboard: {
    userRank: (groupId: string) => `/api/groups/${groupId}/leaderboard/rank`,
    userActivities: (groupId: string) => `/api/groups/${groupId}/leaderboard/activities`,
  },

  // Payments
  payments: {
    activeSubscription: (groupId: string) => `/api/groups/${groupId}/payments/subscription`,
    stripeIntegration: (groupId: string) => `/api/groups/${groupId}/payments/stripe`,
  },

  // Auth
  auth: {
    user: () => `/api/auth/user`,
    role: (groupId: string) => `/api/auth/role/${groupId}`,
  },
} as const
