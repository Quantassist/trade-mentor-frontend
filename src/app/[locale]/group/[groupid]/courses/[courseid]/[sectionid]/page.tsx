import { onAuthenticatedUser } from "@/actions/auth";
import { CourseContentForm } from "@/components/form/course-content";

type Props = {
  params: Promise<{ sectionid: string; groupid: string; locale: string }>;
};

const CourseModuleSection = async (props: Props) => {
  const { sectionid, groupid, locale } = await props.params;
  const user = await onAuthenticatedUser();
  return (
    <div className="container mx-auto max-w-6xl py-6 px-5">
      <div className="rounded-xl overflow-hidden border border-themeGray/60 bg-[#161a20]">
        <CourseContentForm
          groupid={groupid}
          sectionid={sectionid}
          userid={user?.id!}
          locale={locale}
        />
      </div>
    </div>
  );
};

export default CourseModuleSection;
