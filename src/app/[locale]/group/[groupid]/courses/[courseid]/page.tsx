import { onGetCourseLandingSection } from "@/actions/courses";
import { redirect } from "@/i18n/navigation";

type CoursePageProprs = {
  params: Promise<{ courseid: string; groupid: string; locale: string }>
}

const CoursePage = async ({ params }: CoursePageProprs) => {
  const { courseid, groupid, locale } = await params

  // Ask server action for the best landing section for this user/course
  const landing = await onGetCourseLandingSection(courseid)
  if (landing.status === 200 && landing.sectionId) {
    return redirect({ href: `/group/${groupid}/courses/${courseid}/${landing.sectionId}`, locale })
  }

  // 3) If the course has no sections yet, render an empty state
  return <div />
}

export default CoursePage
