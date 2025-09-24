"use client"
import { Input } from "@/components/ui/input"
import { useCreateChannelPost } from "@/hooks/channels"
import { zodResolver } from "@hookform/resolvers/zod"
import { JSONContent } from "novel"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import BlockTextEditor from "../rich-text-editor"
import { CreateChannelPostSchema } from "./schema"

type SubmitPayload = {
  title: string
  content?: string
  htmlcontent?: string
  jsoncontent?: string
}

type PostContentProps = {
  channelid?: string
  formId?: string
  initialTitle?: string
  initialJson?: string | null
  initialHtml?: string | null
  initialContent?: string | null
  onSubmit?: (values: SubmitPayload) => void | Promise<void>
}

export const PostContent = ({
  channelid,
  formId,
  initialTitle,
  initialJson,
  initialHtml,
  initialContent,
  onSubmit,
}: PostContentProps) => {
  // Edit mode: when onSubmit is provided, manage local state and submit to callback
  if (onSubmit) {
    const [onJsonDescription, setJsonDescription] = useState<JSONContent | undefined>(
      initialJson ? (JSON.parse(initialJson) as JSONContent) : undefined,
    )
    const [onHtmlDescription, setOnHtmlDescription] = useState<string | undefined>(
      initialHtml ?? undefined,
    )
    const [onDescription, setOnDescription] = useState<string | undefined>(
      initialContent ?? undefined,
    )

    const {
      formState: { errors },
      register,
      handleSubmit,
      setValue,
    } = useForm<SubmitPayload>({
      resolver: zodResolver(CreateChannelPostSchema),
      defaultValues: {
        title: initialTitle ?? "",
      },
    })

    const onSetDescription = () => {
      const jsonContent = JSON.stringify(onJsonDescription)
      setValue("jsoncontent", jsonContent)
      setValue("htmlcontent", onHtmlDescription)
      setValue("content", onDescription)
    }

    useEffect(() => {
      onSetDescription()
      return () => {
        onSetDescription()
      }
    }, [onJsonDescription, onDescription, onHtmlDescription])

    const submit = handleSubmit(async (values) => onSubmit(values))

    return (
      <form
        className="flex flex-col w-full flex-1 overflow-auto gap-y-5"
        onSubmit={submit}
        id={formId}
      >
        <Input
          placeholder="Title"
          className="bg-transparent outline-none border-none text-2xl p-0"
          {...register("title")}
        />
        <BlockTextEditor
          errors={errors as any}
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

  // Create mode: default to existing behavior
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
  } = useCreateChannelPost(channelid!)
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
