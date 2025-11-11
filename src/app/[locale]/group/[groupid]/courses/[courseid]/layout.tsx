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
  return (
    <HydrationBoundary state={dehydrate(client)}>
      <div className="min-h-[100svh] md:flex">
        <div
          className="bg-themeBlack p-5 md:fixed md:z-0 md:overflow-y-auto md:w-80"
          style={{
            top: "calc(var(--group-navbar-h, 5rem) - 1px)",
            height: "calc(100dvh - (var(--group-navbar-h, 5rem) - 1px))",
          }}
        >
          <CreateCourseModule // Optimistic UI component
            courseid={courseid}
            groupid={groupid}
          />
          <CourseModuleList //DB data component
            courseId={courseid}
            groupid={groupid}
          />
        </div>
        <div className="flex-1 md:ml-80 pb-10 bg-[#101011]/90">
          {children}
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default CourseLayout
