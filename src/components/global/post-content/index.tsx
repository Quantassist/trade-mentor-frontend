"use client"
import { Input } from "@/components/ui/input"
import { useCreateChannelPost } from "@/hooks/channels"
import BlockTextEditor from "../rich-text-editor"

type PostContentProps = {
  channelid: string
  formId?: string
}

export const PostContent = ({ channelid, formId }: PostContentProps) => {
  const {
    errors,
    register,
    onDescription,
    onJsonDescription,
    onHtmlDescription,
    setOnDescription,
    setJsonDescription,
    setOnHtmlDescription,
    onCreatePost,
  } = useCreateChannelPost(channelid)
  return (
    <form
      className="flex flex-col w-full flex-1 overflow-auto gap-y-5"
      onSubmit={onCreatePost}
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
        content={onJsonDescription}
        setContent={setJsonDescription}
        htmlContent={onHtmlDescription}
        setHtmlContent={setOnHtmlDescription}
      />
    </form>
  )
}
