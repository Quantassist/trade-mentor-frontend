import { onGetUserGroupRole } from "@/actions/auth"
import { onGetGroupCourses } from "@/actions/courses"
import { CourseCreate } from "@/components/form/create-course"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { canCreateCourse } from "@/lib/rbac"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { CourseList } from "./_components/course-list"

type CoursePageProps = {
  params: Promise<{ locale: string; groupid: string }>
}

const CoursesPage = async ({ params }: CoursePageProps) => {
  const { locale, groupid } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "courses" })
  const client = new QueryClient()

  const buckets = await onGetGroupCourses(groupid, "buckets", locale)
  if (buckets.status === 200) {
    client.setQueryData(["group-courses", groupid, "all", locale], { status: 200, courses: buckets.all })
    client.setQueryData(["group-courses", groupid, "in_progress", locale], { status: 200, courses: buckets.in_progress })
    client.setQueryData(["group-courses", groupid, "completed", locale], { status: 200, courses: buckets.completed })
    client.setQueryData(["group-courses", groupid, "unpublished", locale], { status: 200, courses: buckets.unpublished })
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
          <h1 className="text-2xl font-semibold text-themeTextWhite">{t("title")}</h1>
          {canCreate && <CourseCreate groupid={groupid} variant="button" />}
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-themeGray text-themeTextGray">
            <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
            <TabsTrigger value="in_progress">{t("tabs.inProgress")}</TabsTrigger>
            <TabsTrigger value="completed">{t("tabs.completed")}</TabsTrigger>
            {canCreate && <TabsTrigger value="unpublished">{t("tabs.unpublished")}</TabsTrigger>}
          </TabsList>
          <TabsContent value="all">
            <CourseList groupid={groupid} filter="all" canManage={canCreate} />
          </TabsContent>
          <TabsContent value="in_progress">
            <CourseList groupid={groupid} filter="in_progress" canManage={canCreate} />
          </TabsContent>
          <TabsContent value="completed">
            <CourseList groupid={groupid} filter="completed" canManage={canCreate} />
          </TabsContent>
          {canCreate && (
            <TabsContent value="unpublished">
              <CourseList groupid={groupid} filter="unpublished" canManage={canCreate} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </HydrationBoundary>
  )
}

export default CoursesPage
