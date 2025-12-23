"use client"

import { HtmlParser } from "@/components/global/html-parser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePostClaps } from "@/hooks/groups"
import { Comment } from "@/icons"
import { formatDistanceToNow } from "date-fns"
import { ClapButton } from "../../feed/[channelid]/_components/post-feed/clap-button"

type User = {
  id: string
  firstname: string
  lastname: string
  avatar?: string
}

type Channel = {
  id: string
  name: string
}

type Clap = {
  id: string
  userId: string
  count: number
}

type Comment = {
  id: string
  content: string
  user: User
  createdAt: string
}

export type Post = {
  id?: string
  createdAt: string
  updatedAt?: string
  content?: string
  htmlContent: string
  author: User
  claps?: Clap[]
  comments?: Comment[]
  channel: Channel
}

interface PostCardProps {
  post: Post
  feed?: boolean
  userId: string
}

const PostCard = ({ post, feed, userId }: PostCardProps) => {
  const { totalClaps, myClaps, handleClap, showConfetti } = usePostClaps(post, userId)

  return (
    <div className="text-left w-full max-w-xl pt-4 bg-[#1C1C1E] text-white rounded-xl border border-[#27272A]">
      <div className="flex items-center mb-4 px-4">
        <Avatar className="w-12 h-12 mr-4">
          <AvatarImage src={post.author.avatar} />
          <AvatarFallback>{post.author.firstname[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">
            {post.author.firstname} {post.author.lastname}
          </div>
          <div className="text-sm text-gray-400">
            {formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
            })}{" "}
            in <span className="text-white">{post.channel.name}</span>{" "}
          </div>
        </div>
      </div>
      <div
        className="pb-4 px-6 whitespace-pre-wrap overflow-clip"
        style={{ maxHeight: feed ? "" : 200 }}
      >
        <HtmlParser html={post.htmlContent ?? ""} />
      </div>
      <div className="flex items-center justify-between border-t border-[#27272A] px-5 py-2">
        <div className="flex gap-5 text-[#757272] text-sm">
          <ClapButton
            totalClaps={totalClaps}
            myClaps={myClaps}
            onClap={handleClap}
            showConfetti={showConfetti}
          />

          <span className="flex gap-1 justify-center items-center p-1">
            <Comment />
            {post.comments?.length ?? 0}
          </span>
          <div className="flex -space-x-2 p-1">
            {[1, 2, 3, 4].map((index) => (
              <Avatar key={index} className="w-5 h-5 border border-[#505050]">
                <AvatarFallback className="text-xs">U</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostCard
