"use client"
import { PostCard } from "@/app/group/[groupid]/channel/[channelid]/_components/post-feed/post-card"
import { PostContent } from "@/components/global/post-content"
import { SimpleModal } from "@/components/global/simple-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { DialogClose } from "@/components/ui/dialog"
import { useChannelPage } from "@/hooks/channels"
import { Upload } from "lucide-react"

type Props = {
  userImage: string
  channelid: string
  username: string
}

const CreateNewPost = ({ userImage, channelid, username }: Props) => {
  const { data, mutation } = useChannelPage(channelid)
  const { name } = data as { name: string }
  const formId = "create-post-form"

  return (
    <>
      <SimpleModal
        trigger={
          <span>
            <Card className="border-themeGray cursor-pointer first-letter:rounded-2xl overflow-hidden">
              <CardContent className="p-3 bg-[#1A1A1D] flex gap-x-6 items-center">
                <Avatar className="cursor-pointer">
                  <AvatarImage src={userImage} alt="user" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <CardDescription className="text-themeTextGray">
                  Type / to add elements to your post
                </CardDescription>
              </CardContent>
            </Card>
          </span>
        }
      >
        <div className="flex gap-x-3">
          <Avatar className="cursor-pointer">
            <AvatarImage src={userImage} alt="user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-themeTextGray text-sm capitalize">{username}</p>
            <p className="text-sm capitalize text-themeTextGray">
              Posting in{" "}
              <span className="font-bold capitalize text-themeTextWhite">
                {name}
              </span>
            </p>
          </div>
        </div>
        {/* Scrollable editor area */}
        <div className="flex-1 overflow-auto min-h-0">
          <PostContent channelid={channelid} formId={formId} />
        </div>
        {/* Fixed footer row inside DialogContent */}
        <div className="mt-2 border-t border-themeDarkGray pt-3 flex justify-end">
          <DialogClose asChild>
            <Button
              type="submit"
              form={formId}
              className="rounded-2xl bg-primary text-primary-foreground flex gap-x-2"
            >
              <Upload />
              Create
            </Button>
          </DialogClose>
        </div>
      </SimpleModal>
      {mutation.length > 0 &&
        mutation[0].status === "pending" &&
        mutation[0].state && (
          <PostCard
            channelname={name}
            userimage={userImage}
            username={username}
            html={mutation[0].state.htmlcontent || ""}
            title={mutation[0].state.title || ""}
            likes={0}
            comments={0}
            postid={mutation[0].state.postid}
            optimistic
          />
        )}
    </>
  )
}

export default CreateNewPost
