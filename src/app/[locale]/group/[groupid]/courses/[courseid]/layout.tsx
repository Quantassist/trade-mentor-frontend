import { getQueryClient } from "@/lib/get-query-client"
import {
    dehydrate,
    HydrationBoundary,
} from "@tanstack/react-query"
import { CreateCourseModule } from "../_components/create-course-module"
import { CourseModuleList } from "../_components/module-list"
import { AutoCollapseSidebar } from "./_components/auto-collapse-sidebar"

type CourseLayoutProps = {
  params: Promise<{
    courseid: string
    groupid: string
  }>
  children: React.ReactNode
}

const CourseLayout = async ({ params, children }: CourseLayoutProps) => {
  const { courseid, groupid } = await params
  const client = getQueryClient()
  return (
    <HydrationBoundary state={dehydrate(client)}>
      <AutoCollapseSidebar />
      <div className="min-h-[100svh] md:flex">
        <div
          className="bg-white dark:bg-themeBlack p-5 md:fixed md:z-10 md:overflow-y-auto md:w-96 border-r border-slate-200 dark:border-transparent"
          style={{
            top: "var(--group-navbar-h, 5rem)",
            height: "calc(100dvh - var(--group-navbar-h, 5rem))",
          }}
        >
          <CreateCourseModule // Optimistic UI component
            courseid={courseid}
            groupid={groupid}
          />
          <div className="mt-4">
            <CourseModuleList //DB data component
              courseId={courseid}
              groupid={groupid}
            />
          </div>
        </div>
        <div className="flex-1 md:ml-96 pb-10 bg-slate-50 dark:bg-[#101011]/90">
          {children}
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default CourseLayout
