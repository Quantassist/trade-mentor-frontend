import { onAuthenticatedUser } from "@/actions/auth";
import { onGetGroupInfo } from "@/actions/groups";
import { CourseContentForm } from "@/components/form/course-content";

type Props = {
  params: Promise<{ sectionid: string; groupid: string; locale: string }>;
};

const CourseModuleSection = async (props: Props) => {
  const { sectionid, groupid, locale } = await props.params;
  const user = await onAuthenticatedUser();
  const group = await onGetGroupInfo(groupid);
  return (
    <CourseContentForm
      groupid={group.group?.userId!}
      sectionid={sectionid}
      userid={user?.id!}
      locale={locale}
    />
  );
};

export default CourseModuleSection;
