"use client"
import { Input } from "@/components/ui/input"
import { useCreateChannelPost } from "@/hooks/channels"
import { JSONContent } from "novel"
import { useEffect } from "react"
import BlockTextEditor from "../rich-text-editor"

type PostContentProps = {
  channelid?: string
  formId?: string
  postid?: string
  initialTitle?: string
  initialJson?: string | null
  initialHtml?: string | null
  initialContent?: string | null
}

export const PostContent = ({
  channelid,
  formId,
  postid,
  initialTitle,
  initialJson,
  initialHtml,
  initialContent,
}: PostContentProps) => {
  // Decide mode based on presence of postid
  const isEdit = Boolean(postid)

  const {
    errors,
    register,
    onDescription,
    onJsonDescription,
    onHtmlDescription,
    setOnDescription,
    setJsonDescription,
    setOnHtmlDescription,
    onSubmitPost,
  } = useCreateChannelPost(
    isEdit
      ? {
          mode: "edit",
          postid: postid!,
          initial: {
            title: initialTitle ?? "",
            htmlcontent: initialHtml ?? undefined,
            jsoncontent: initialJson ?? undefined,
            content: initialContent ?? undefined,
          },
        }
      : { mode: "create", channelid: channelid! },
  )

  // Ensure initial content is pushed into RHF values on mount if needed (hook handles setValue on state change)
  useEffect(() => {
    // no-op: hook internally syncs values when state changes
  }, [])

  return (
    <form
      className="flex flex-col w-full flex-1 overflow-auto gap-y-5"
      onSubmit={onSubmitPost}
      id={formId}
    >
      <Input
        placeholder="Title"
        className="bg-transparent outline-none border-none text-2xl p-0"
        {...register("title")}
      />
      <BlockTextEditor
        errors={errors}
        name="jsoncontent"
        min={0}
        max={10000}
        inline
        onEdit
        textContent={onDescription}
        setTextContent={setOnDescription}
        content={onJsonDescription as JSONContent | undefined}
        setContent={setJsonDescription}
        htmlContent={onHtmlDescription}
        setHtmlContent={setOnHtmlDescription}
      />
    </form>
  )
}
