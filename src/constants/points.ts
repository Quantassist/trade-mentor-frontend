import { ActivityType } from "@prisma/client"

// Point values for different activities
// CLAP_RECEIVED: Points per clap received on posts (scales with clap count)
// COMMENT_CLAP_RECEIVED: Points per clap received on comments
export const POINT_VALUES: Record<ActivityType, number> = {
  POST_CREATED: 10,
  CLAP_RECEIVED: 1, // Per clap received
  COMMENT_CREATED: 3,
  COMMENT_CLAP_RECEIVED: 1, // Per clap received on comment
  COURSE_COMPLETED: 50,
  SECTION_COMPLETED: 5,
  QUIZ_PASSED: 15,
  EVENT_ATTENDED: 20,
  DAILY_LOGIN: 1,
}
