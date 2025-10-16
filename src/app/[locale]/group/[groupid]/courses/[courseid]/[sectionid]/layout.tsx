import { onGetCourseModules, onGetSectionInfo } from "@/actions/courses";
import SectionNavBar from "@/app/[locale]/group/[groupid]/courses/[courseid]/[sectionid]/_components/section-navbar";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

type CourseContentPageProps = {
  children: React.ReactNode;
  params: Promise<{ sectionid: string; courseid: string; locale: string; groupid: string }>;
};

const CourseContentPage = async ({ children, params }: CourseContentPageProps) => {
  const { sectionid, courseid, locale, groupid } = await params;
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        // Reasonable defaults for SSR + client hydration
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false,
      },
    },
  });

  await Promise.allSettled([
    client.prefetchQuery({
      queryKey: ["section-info", sectionid, locale],
      queryFn: () => onGetSectionInfo(sectionid, locale),
      staleTime: 60_000,
      gcTime: 5 * 60_000,
    }),
    client.prefetchQuery({
      queryKey: ["course-modules", courseid],
      queryFn: () => onGetCourseModules(courseid),
      staleTime: 60_000,
      gcTime: 5 * 60_000,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <SectionNavBar sectionid={sectionid} groupid={groupid} />
      {children}
    </HydrationBoundary>
  );
};

export default CourseContentPage;
