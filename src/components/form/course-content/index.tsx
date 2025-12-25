"use client"
import SectionAnchors from "@/components/anchors/section-anchors"
import { HtmlParser } from "@/components/global/html-parser"
import { Loader } from "@/components/global/loader"
import BlockTextEditor from "@/components/global/rich-text-editor"
import { Button } from "@/components/ui/button"
import { useCourseContent, useCourseSectionInfo } from "@/hooks/courses"
import { api } from "@/lib/api"
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
    queryFn: () => api.groups.getInfo(groupid, locale),
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
    setOnEditDescription,
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

  // For managers: show read-only view with Edit button, or edit mode with Save button
  if (canManage) {
    return (
      <div className="bg-[#1e2329] p-5 overflow-x-hidden">
        {/* Top action bar - shows Edit button or Cancel/Save buttons */}
        <div className="flex justify-end mb-3 gap-3">
          {onEditDescription ? (
            <>
              <Button
                type="button"
                variant="ghost"
                className="text-themeTextGray hover:text-white"
                onClick={() => setOnEditDescription(false)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-md px-3 py-1.5 text-sm text-white bg-[#4F46E5] hover:bg-[#4F46E5]/90 ring-1 ring-[#4F46E5]/30"
                onClick={onUpdateContent}
              >
                <Loader loading={isPending}>Save Content</Loader>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              className="rounded-md px-3 py-1.5 text-sm text-white bg-[#4F46E5] hover:bg-[#4F46E5]/90 ring-1 ring-[#4F46E5]/30"
              onClick={() => setOnEditDescription(true)}
            >
              Edit section
            </Button>
          )}
        </div>
        <SectionAnchors
          moduleId={(data?.section?.Module?.id as string) || undefined}
          anchorIds={Array.isArray((data as any)?.section?.anchorIds) ? (data as any).section.anchorIds : []}
          className="mb-3"
        />
        {onEditDescription ? (
          <form ref={editor}>
            <BlockTextEditor
              onEdit={true}
              max={10000}
              inline
              min={10}
              disabled={false}
              name="content"
              errors={errors}
              setContent={setJsonDescription || undefined}
              content={onJsonDescription}
              htmlContent={data?.section?.htmlContent || undefined}
              setHtmlContent={setOnHtmlDescription}
              textContent={onDescription}
              setTextContent={setOnDescription}
            />
          </form>
        ) : (
          <HtmlParser html={data?.section?.htmlContent!} />
        )}
      </div>
    )
  }

  // Non-managers: read-only view
  return (
    <div className="bg-[#1e2329] p-5 overflow-x-hidden">
      <SectionAnchors
        moduleId={(data?.section?.Module?.id as string) || undefined}
        anchorIds={Array.isArray((data as any)?.section?.anchorIds) ? (data as any).section.anchorIds : []}
        className="mb-3"
      />
      <HtmlParser html={data?.section?.htmlContent!} />
    </div>
  )
}
