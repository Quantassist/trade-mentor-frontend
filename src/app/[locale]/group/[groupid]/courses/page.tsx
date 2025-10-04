import { onGetUserGroupRole } from "@/actions/auth"
import { onGetGroupCourses } from "@/actions/courses"
import { CourseCreate } from "@/components/form/create-course"
import { canCreateCourse } from "@/lib/rbac"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import { CourseList } from "./_components/course-list"

type CoursePageProps = {
  params: Promise<{ groupid: string }>
}

const CoursesPage = async ({ params }: CoursePageProps) => {
  const { groupid } = await params
  const client = new QueryClient()

  const buckets = await onGetGroupCourses(groupid, "buckets")
  if (buckets.status === 200) {
    client.setQueryData(["group-courses", groupid, "all"], { status: 200, courses: buckets.all })
    client.setQueryData(["group-courses", groupid, "in_progress"], { status: 200, courses: buckets.in_progress })
    client.setQueryData(["group-courses", groupid, "completed"], { status: 200, courses: buckets.completed })
    client.setQueryData(["group-courses", groupid, "unpublished"], { status: 200, courses: buckets.unpublished })
  }

  // Check user permissions
  const userRole = await onGetUserGroupRole(groupid)
  const canCreate =
    userRole.status === 200 &&
    canCreateCourse(userRole.role, userRole.isSuperAdmin)

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <div className="container py-10 px-5">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-themeTextWhite">My Learnings</h1>
          {canCreate && <CourseCreate groupid={groupid} variant="button" />}
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-themeGray text-themeTextGray">
            <TabsTrigger value="all">My courses</TabsTrigger>
            <TabsTrigger value="in_progress">In-progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            {canCreate && <TabsTrigger value="unpublished">Unpublished</TabsTrigger>}
          </TabsList>
          <TabsContent value="all">
            <CourseList groupid={groupid} filter="all" />
          </TabsContent>
          <TabsContent value="in_progress">
            <CourseList groupid={groupid} filter="in_progress" />
          </TabsContent>
          <TabsContent value="completed">
            <CourseList groupid={groupid} filter="completed" />
          </TabsContent>
          {canCreate && (
            <TabsContent value="unpublished">
              <CourseList groupid={groupid} filter="unpublished" />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </HydrationBoundary>
  )
}

export default CoursesPage
