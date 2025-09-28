"use client"
import { HtmlParser } from "@/components/global/html-parser"
import { Loader } from "@/components/global/loader"
import BlockTextEditor from "@/components/global/rich-text-editor"
import { Button } from "@/components/ui/button"
import { useCourseContent, useCourseSectionInfo } from "@/hooks/courses"

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
    data?.section?.content || null,
    data?.section?.jsonContent || null,
    data?.section?.htmlContent || null,
    locale,
  )
  return groupid === userid ? (
    <form onSubmit={onUpdateContent} className="flex flex-col p-5" ref={editor}>
      <BlockTextEditor
        onEdit={onEditDescription}
        max={1000}
        inline
        min={10}
        disabled={userid === groupid ? false : true}
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
    <HtmlParser html={data?.section?.htmlContent!} />
  )
}
