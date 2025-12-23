"use client"
import { onGetGroupInfo } from "@/actions/groups"
import { MultiPostContent } from "@/components/global/post-content/multi"
import { SimpleModal } from "@/components/global/simple-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { DialogClose } from "@/components/ui/dialog"
import { useChannelPage } from "@/hooks/channels"
import { useQuery } from "@tanstack/react-query"
import { Upload } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { PostCard } from "../post-feed/post-card"

type Props = {
  userImage: string
  channelid: string
  username: string
  locale?: string
  groupid: string
}

const CreateNewPost = ({ userImage, channelid, username, locale, groupid }: Props) => {
  const { data, mutation } = useChannelPage(channelid, locale)
  const name = (data as any)?.channel?.name as string | undefined
  const formId = "create-post-form"
  const tr = useTranslations("channel")
  const currentLocale = useLocale()

  // Fetch role info using the same key as server prefetch
  const { data: groupInfo } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => onGetGroupInfo(groupid, locale),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })

  const role = groupInfo?.role as string | undefined
  const canManage = Boolean(groupInfo?.isSuperAdmin || groupInfo?.groupOwner || role === "ADMIN")
  const restricted = ["general", "announcements"]
  const isRestricted = restricted.includes((name || "").toLowerCase())
  const canPost = canManage || !isRestricted

  return (
    <>
      {canPost && (
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
                    {tr("hintAddElements")}
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
                {currentLocale === "hi" ? (
                  <>
                    <span className="font-bold capitalize text-themeTextWhite">{name}</span>{" "}
                    {tr("postingIn")}
                  </>
                ) : (
                  <>
                    {tr("postingIn")} {" "}
                    <span className="font-bold capitalize text-themeTextWhite">{name}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          {/* Scrollable editor area */}
          <div className="flex-1 overflow-auto min-h-0">
            <MultiPostContent
              channelid={channelid}
              formId={formId}
              hideTabs={!canManage}
              forceLocale={!canManage ? "en" : undefined}
            />
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
      )}
      {mutation.length > 0 &&
        mutation[0].status === "pending" &&
        mutation[0].state && (
          <PostCard
            channelname={name || ""}
            userimage={userImage}
            username={username}
            html={mutation[0].state.htmlcontent || ""}
            title={mutation[0].state.title || ""}
            totalClaps={0}
            myClaps={0}
            comments={0}
            postid={mutation[0].state.postid}
            optimistic
            onClap={() => {}}
            showConfetti={false}
          />
        )}
    </>
  )
}

export default CreateNewPost
