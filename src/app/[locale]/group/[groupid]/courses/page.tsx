import { onGetGroupCourses } from "@/actions/courses"
import { CourseCreate } from "@/components/form/create-course"
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

  await client.prefetchQuery({
    queryKey: ["group-courses"],
    queryFn: () => onGetGroupCourses(groupid),
  })

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <div className="container grid lg:grid-cols-2 2xl:grid-cols-3 py-10 px-5 gap-5">
        <CourseCreate groupid={groupid} />
        <CourseList groupid={groupid} />
      </div>
    </HydrationBoundary>
  )
}

export default CoursesPage
