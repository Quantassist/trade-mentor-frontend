import { onGetSectionInfo } from "@/actions/courses";
import SectionNavBar from "@/app/group/[groupid]/courses/[courseid]/[sectionid]/_components/section-navbar";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

type CourseContentPageProps = {
  children: React.ReactNode;
  params: Promise<{ sectionid: string; locale: string }>;
};

const CourseContentPage = async ({ children, params }: CourseContentPageProps) => {
  const { sectionid, locale } = await params;
  const client = new QueryClient();

  await client.prefetchQuery({
    queryKey: ["section-info", sectionid, locale],
    queryFn: () => onGetSectionInfo(sectionid, locale),
  });

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <SectionNavBar sectionid={sectionid} />
      {children}
    </HydrationBoundary>
  );
};

export default CourseContentPage;
