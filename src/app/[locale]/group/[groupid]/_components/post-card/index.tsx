"use client"

import { HtmlParser } from "@/components/global/html-parser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePostCard } from "@/hooks/groups"
import { Comment, LikeIcon } from "@/icons"
import { formatDistanceToNow } from "date-fns"

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

type Like = {
  id: string
  userId: string
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
  likes?: Like[]
  comments?: Comment[]
  channel: Channel
}

interface PostCardProps {
  post: Post
  feed?: boolean
  userId: string
}

const PostCard = ({ post, feed, userId }: PostCardProps) => {
  const { liked, handleLikePress, likes } = usePostCard(post, userId)

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
      <div className="flex items-center justify-between border-t border-[#27272A] px-5 py-1">
        <div className="flex gap-5 text-[#757272] text-sm">
          <span
            className="flex gap-1 justify-center items-center hover:bg-themeBlack p-1 rounded-full px-3"
            onClick={(e) => {
              e.stopPropagation()
              handleLikePress()
            }}
          >
            <LikeIcon color={liked ? "" : "none"} />
            {likes}
          </span>

          <span className="flex gap-1 justify-center items-center p-1">
            <Comment />
            {/* {post.comments.length} */}
            21
          </span>
          <div className="flex -space-x-2 p-1">
            {/* {post.comments.slice(0, 4).map((comment, index) => (
                            <Avatar
                            key={index}
                            className="w-5 h-5 border border-[#505050]"
                            >
                            <AvatarImage src={comment.user.avatar} />
                            <AvatarFallback className="text-xs">
                            {comment.user.firstname[0]}
                            </AvatarFallback>
                            </Avatar>
                            ))} */}
            {/* place holder code for now  */}
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
