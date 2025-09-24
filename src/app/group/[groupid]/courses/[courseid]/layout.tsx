import { onGetCourseModules } from "@/actions/courses"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import { CreateCourseModule } from "../_components/create-course-module"
import { CourseModuleList } from "../_components/module-list"

type CourseLayoutProps = {
  params: Promise<{
    courseid: string
    groupid: string
  }>
  children: React.ReactNode
}

const CourseLayout = async ({ params, children }: CourseLayoutProps) => {
  const { courseid, groupid } = await params
  const client = new QueryClient()

  await client.prefetchQuery({
    queryKey: ["course-modules", courseid],
    queryFn: () => onGetCourseModules(courseid),
  })
  return (
    <HydrationBoundary state={dehydrate(client)}>
      <div className="grid grid-cols-1 h-full lg:grid-cols-4 overflow-hidden">
        <div className="bg-themeBlack p-5 overflow-y-auto">
          <CreateCourseModule // Optimistic UI component
            courseid={courseid}
            groupid={groupid}
          />
          <CourseModuleList //DB data component
            courseId={courseid}
            groupid={groupid}
          />
        </div>
        <div className="lg:col-span-3 max-h-full h-full pb-10 overflow-y-auto bg-[#101011]/90">
          {children}
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default CourseLayout
