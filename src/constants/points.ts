import { ActivityType } from "@prisma/client"

// Point values for different activities
export const POINT_VALUES: Record<ActivityType, number> = {
  POST_CREATED: 10,
  POST_USEFUL_RECEIVED: 5,
  POST_USEFUL_GIVEN: 2,
  COMMENT_CREATED: 3,
  COURSE_COMPLETED: 50,
  SECTION_COMPLETED: 5,
  QUIZ_PASSED: 15,
  EVENT_ATTENDED: 20,
  DAILY_LOGIN: 1,
}
