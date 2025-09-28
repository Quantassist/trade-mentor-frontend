import { onGetCourseModules, onGetSectionInfo } from "@/actions/courses";
import SectionNavBar from "@/app/[locale]/group/[groupid]/courses/[courseid]/[sectionid]/_components/section-navbar";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

type CourseContentPageProps = {
  children: React.ReactNode;
  params: Promise<{ sectionid: string; courseid: string; locale: string }>;
};

const CourseContentPage = async ({ children, params }: CourseContentPageProps) => {
  const { sectionid, courseid, locale } = await params;
  const client = new QueryClient();

  await Promise.all([
    client.prefetchQuery({
      queryKey: ["section-info", sectionid, locale],
      queryFn: () => onGetSectionInfo(sectionid, locale),
    }),
    client.prefetchQuery({
      queryKey: ["course-modules"],
      queryFn: () => onGetCourseModules(courseid),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <SectionNavBar sectionid={sectionid} />
      {children}
    </HydrationBoundary>
  );
};

export default CourseContentPage;
