"use client"
import { onGetGroupInfo } from "@/actions/groups"
import { HtmlParser } from "@/components/global/html-parser"
import { Loader } from "@/components/global/loader"
import BlockTextEditor from "@/components/global/rich-text-editor"
import { Button } from "@/components/ui/button"
import SectionAnchors from "@/components/anchors/section-anchors"
import { useCourseContent, useCourseSectionInfo } from "@/hooks/courses"
import { useQuery } from "@tanstack/react-query"

type CourseContentFormProps = {
  groupid: string
  sectionid: string
  userid: string
  locale?: string
}

export const CourseContentForm = ({
  groupid,
  sectionid,
  userid,
  locale,
}: CourseContentFormProps) => {
  const { data } = useCourseSectionInfo(sectionid, locale)
  const {data: about} = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => onGetGroupInfo(groupid, locale),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })
  const canManage = Boolean(
    (about as any)?.isSuperAdmin ||
    (about as any)?.groupOwner ||
    (about as any)?.role === "ADMIN"
  )
  const {
    errors,
    onUpdateContent,
    setJsonDescription,
    setOnDescription,
    onEditDescription,
    editor,
    isPending,
    setOnHtmlDescription,
    onJsonDescription,
    onDescription,
  } = useCourseContent(
    sectionid,
    groupid,
    data?.section?.content || null,
    data?.section?.jsonContent || null,
    data?.section?.htmlContent || null,
    locale,
  )
  return canManage ? (
    <form onSubmit={onUpdateContent} className="flex flex-col p-5 bg-[#12151b]" ref={editor}>
      <SectionAnchors
        moduleId={(data?.section?.Module?.id as string) || undefined}
        anchorIds={Array.isArray((data as any)?.section?.anchorIds) ? (data as any).section.anchorIds : []}
        className="mb-3"
      />
      <BlockTextEditor
        onEdit={onEditDescription}
        max={2000}
        inline
        min={10}
        disabled={canManage ? false : true}
        name="content"
        errors={errors}
        setContent={setJsonDescription || undefined}
        content={onJsonDescription}
        htmlContent={data?.section?.htmlContent || undefined}
        setHtmlContent={setOnHtmlDescription}
        textContent={onDescription}
        setTextContent={setOnDescription}
      />
      {onEditDescription && (
        <Button
          className="mt-5 self-end bg-themeBlack border-themeGray"
          variant="outline"
          type="submit"
        >
          <Loader loading={isPending}>Save Content</Loader>
        </Button>
      )}
    </form>
  ) : (
    <div className="bg-[#12151b] p-5">
      <SectionAnchors
        moduleId={(data?.section?.Module?.id as string) || undefined}
        anchorIds={Array.isArray((data as any)?.section?.anchorIds) ? (data as any).section.anchorIds : []}
        className="mb-3"
      />
      <HtmlParser html={data?.section?.htmlContent!} />
    </div>
  )
}
