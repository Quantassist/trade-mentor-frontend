import { onAuthenticatedUser } from "@/actions/auth";
import { onGetModuleAnchors, onGetSectionInfo } from "@/actions/courses";
import { CourseContentForm } from "@/components/form/course-content";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import TypedSectionRenderer from "./_components/typed-section-renderer";

type Props = {
  params: Promise<{ sectionid: string; groupid: string; locale: string }>;
};

const CourseModuleSection = async (props: Props) => {
  const { sectionid, groupid, locale } = await props.params;
  const [user, res] = await Promise.all([
    onAuthenticatedUser(),
    onGetSectionInfo(sectionid, locale),
  ]);

  // Hydrate TanStack Query cache so child views use useQuery without re-calling
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false, refetchOnReconnect: true, refetchOnMount: false } },
  });
  client.setQueryData(["section-info", sectionid, locale], res);

  // Prefetch module anchors once and prime cache for all sections in this module
  const moduleId = res?.status === 200 ? (res as any)?.section?.Module?.id : undefined;
  if (moduleId) {
    const anchorsRes = await onGetModuleAnchors(moduleId);
    client.setQueryData(["module-anchors", moduleId, locale], anchorsRes);
  }

  const section = res?.status === 200 ? (res as any).section : null;
  const userSnapshot = res?.status === 200 ? (res as any).user : null;

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <div className="container mx-auto max-w-8xl py-6 px-5">
        <div className="rounded-xl overflow-hidden border border-themeGray/60 bg-[#161a20]">
          {section?.type === "concept" ? (
            <CourseContentForm
              groupid={groupid}
              sectionid={sectionid}
              userid={user?.id!}
              locale={locale}
            />
          ) : (
            <TypedSectionRenderer
              type={section?.type}
              payload={section?.blockPayload}
              sectionid={sectionid}
              groupid={groupid}
              locale={locale}
              user={userSnapshot}
              initial={res}
            />
          )}
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default CourseModuleSection;
