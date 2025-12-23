/**
 * Data Access Layer - Index
 * Re-exports all data fetching functions for easy imports
 */

// Auth
export {
    getUserById,
    getUserGroupRole
} from "./auth"

// Groups
export {
    getAffiliateInfo,
    getAffiliateLink, getAllGroupMembers, getChannelPosts, getCommentReplies, getDomainConfig, getExploreGroups, getGroupInfo, getGroupMentors, getGroupSubscription,
    getGroupSubscriptions, getPostComments, getPostInfo, getUserGroups, searchGroups, verifyAffiliateLink
} from "./groups"

// Courses
export {
    getCourseAbout, getCourseLandingSection, getCourseModules, getFirstSectionId, getGroupCourses, getMentorProfiles,
    getModuleAnchors, getOngoingCourses, getSectionInfo
} from "./courses"

// Channels
export {
    getChannelInfo, getCommentClaps, getGroupChannels, getPostAllLocales,
    getPostClaps
} from "./channels"

// Events
export {
    checkEventRegistration, getEventById, getGroupEvents
} from "./events"

// Leaderboard
export {
    getGroupLeaderboard, getUserPointActivities, getUserRank
} from "./leaderboard"

// Payments
export {
    getActiveSubscription,
    getStripeIntegration
} from "./payments"

