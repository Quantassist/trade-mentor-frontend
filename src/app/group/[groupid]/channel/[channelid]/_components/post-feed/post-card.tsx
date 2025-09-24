"use client"
import { HtmlParser } from "@/components/global/html-parser"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
}: PostCardProps) => {
  const pathname = usePathname()
  return (
    <Card className="border-themeGray bg-[#1A1A1D] first-letter:rounded-2xl overflow-hidden">
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
