import { onAuthenticatedUser } from "@/actions/auth"
import { onGetGroupInfo } from "@/actions/groups"
import { CourseContentForm } from "@/components/form/course-content"

type Props = {
  params: Promise<{ sectionid: string; groupid: string }>
}

const CourseModuleSection = async (props: Props) => {
  const { sectionid, groupid } = await props.params
  const user = await onAuthenticatedUser()
  const group = await onGetGroupInfo(groupid)
  return (
    <CourseContentForm
      groupid={group.group?.userId!}
      sectionid={sectionid}
      userid={user?.id!}
    />
  )
}

export default CourseModuleSection
