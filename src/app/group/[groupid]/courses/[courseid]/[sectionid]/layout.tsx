import { onGetSectionInfo } from "@/actions/courses"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import SectionNavBar from "./_components/section-navbar"

type CourseContentPageProps = {
  children: React.ReactNode
  params: Promise<{ sectionid: string }>
}

const CourseContentPage = async ({
  children,
  params,
}: CourseContentPageProps) => {
  const { sectionid } = await params
  const client = new QueryClient()

  await client.prefetchQuery({
    queryKey: ["section-info"], // TODO: Verify if I should add sectionid to the queryKey
    queryFn: () => onGetSectionInfo(sectionid),
  })
  return (
    <HydrationBoundary state={dehydrate(client)}>
      <SectionNavBar sectionid={sectionid} />
      {children}
    </HydrationBoundary>
  )
}

export default CourseContentPage
