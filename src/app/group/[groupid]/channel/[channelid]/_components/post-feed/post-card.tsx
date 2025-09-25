"use client"
import { HtmlParser } from "@/components/global/html-parser"
import { PostContent } from "@/components/global/post-content"
import { SimpleModal } from "@/components/global/simple-modal"
import { Card, CardContent } from "@/components/ui/card"
import { DialogClose } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useDeletePost } from "@/hooks/channels"
import { cn } from "@/lib/utils"
import { Pencil, Trash2, Upload } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { Interactions } from "./interactions"
import { PostAuthor } from "./post-author"

type PostCardProps = {
  postid: string
  title: string
  html: string
  likes: number
  comments: number
  channelname: string
  userimage?: string
  username?: string
  likedByMe?: boolean
  optimistic?: boolean
  isAuthor?: boolean
  initialHtml?: string | null
  initialJson?: string | null
  initialContent?: string | null
}

export const PostCard = ({
  userimage,
  username,
  html,
  channelname,
  title,
  likes,
  comments,
  postid,
  likedByMe,
  optimistic,
  isAuthor,
  initialHtml,
  initialJson,
  initialContent,
}: PostCardProps) => {
  const pathname = usePathname()
  const formId = useMemo(() => `edit-post-form-${postid}`, [postid])
  const { mutate: deletePost } = useDeletePost(postid)

  const onDelete = () => {
    if (window.confirm("Delete this post? This action cannot be undone.")) {
      deletePost()
    }
  }
  return (
    <Card className="relative border-themeGray bg-[#1A1A1D] first-letter:rounded-2xl overflow-hidden">
      {isAuthor && (
        <div className={cn("absolute right-3 top-3 z-10 flex gap-2")}>
          <SimpleModal
            trigger={
              <button
                aria-label="Edit post"
                className="p-1 rounded-md hover:bg-[#2A2A2D]"
              >
                <Pencil size={16} />
              </button>
            }
          >
            <>
              <PostContent
                formId={formId}
                postid={postid}
                initialTitle={title}
                initialHtml={initialHtml ?? null}
                initialJson={initialJson ?? null}
                initialContent={initialContent ?? null}
              />
              <div className="mt-2 border-t border-themeDarkGray pt-3 flex justify-end">
                <DialogClose asChild>
                  <button
                    type="submit"
                    form={formId}
                    className="rounded-2xl bg-primary text-primary-foreground flex gap-x-2 px-4 py-2"
                  >
                    <Upload size={16} />
                    Save
                  </button>
                </DialogClose>
              </div>
            </>
          </SimpleModal>
          <button
            aria-label="Delete post"
            onClick={onDelete}
            className="p-1 rounded-md hover:bg-[#2A2A2D]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      <CardContent className="p-3 flex flex-col gap-y-6 items-start">
        <PostAuthor
          image={userimage}
          username={username}
          channel={channelname}
        />
        <Link href={`${pathname}/${postid}`} className="w-full">
          <div className="flex flex-col gap-y-3">
            <h2 className="text-2xl">{title}</h2>
            <HtmlParser html={html} />
          </div>
        </Link>
      </CardContent>
      <Separator orientation="horizontal" className="bg-themeGray mt-3" />
      <Interactions
        id={postid}
        likes={likes}
        comments={comments}
        likedByMe={likedByMe}
        optimistic={optimistic}
      />
    </Card>
  )
}
