"use client"
import { MultiPostContent } from "@/components/global/post-content/multi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useChannelPage } from "@/hooks/channels"
import { api } from "@/lib/api"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useQuery } from "@tanstack/react-query"
import { Upload } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { PostCard } from "../post-feed/post-card"

type Props = {
  userImage: string
  channelid: string
  username: string
  locale?: string
  groupid: string
}

const CreateNewPost = ({ userImage, channelid, username, locale, groupid }: Props) => {
  const [open, setOpen] = useState(false)
  const { data, mutation } = useChannelPage(channelid, locale)
  const name = (data as any)?.channel?.name as string | undefined
  const formId = "create-post-form"
  const tr = useTranslations("channel")
  const t = useTranslations()
  const currentLocale = useLocale()

  // Fetch role info using the same key as server prefetch
  const { data: groupInfo } = useQuery({
    queryKey: ["about-group-info", groupid, locale],
    queryFn: () => api.groups.getInfo(groupid, locale),
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div>
              <Card className="border-slate-200 dark:border-themeGray/60 cursor-pointer rounded-xl overflow-hidden bg-white dark:bg-gradient-to-r dark:from-[#1a1f25] dark:to-[#1e2329] hover:bg-slate-50 dark:hover:from-[#1e2329] dark:hover:to-[#252a32] transition-all duration-300 hover:border-slate-300 dark:hover:border-[#d4f0e7]/30 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-[#d4f0e7]/5 group">
                <CardContent className="p-4 flex gap-x-4 items-center">
                  <Avatar className="h-11 w-11 ring-2 ring-[#d4f0e7]/20 group-hover:ring-[#d4f0e7]/40 transition-all">
                    <AvatarImage src={userImage} alt="user" />
                    <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-100 dark:from-[#2a3441] dark:to-[#1e2329] text-slate-600 dark:text-themeTextWhite">
                      {username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex flex-col gap-y-0.5">
                      <span className="text-slate-500 dark:text-themeTextGray/80 text-sm group-hover:text-slate-700 dark:group-hover:text-themeTextGray transition-colors">
                        {tr("hintAddElements")}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-themeTextGray/50">
                        Share your thoughts with the community
                      </span>
                    </div>
                    <div className="flex items-center gap-x-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-[#d4f0e7]/10 text-emerald-600 dark:text-[#d4f0e7] text-sm font-medium group-hover:bg-emerald-500/20 dark:group-hover:bg-[#d4f0e7]/20 transition-all">
                      <Upload size={16} />
                      <span className="hidden sm:inline">{t("createPost.button")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogTrigger>
          <DialogContent
            role="dialog"
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            className="bg-white dark:bg-[#1C1C1E] !max-w-2xl border-slate-200 dark:border-themeDarkGray"
          >
            <DialogHeader>
              <VisuallyHidden>
                <DialogTitle>Create Post</DialogTitle>
              </VisuallyHidden>
            </DialogHeader>
            <div className="flex gap-x-3">
              <Avatar className="cursor-pointer">
                <AvatarImage src={userImage} alt="user" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-slate-500 dark:text-themeTextGray text-sm capitalize">{username}</p>
                <p className="text-sm capitalize text-slate-500 dark:text-themeTextGray">
                  {currentLocale === "hi" ? (
                    <>
                      <span className="font-bold capitalize text-slate-900 dark:text-themeTextWhite">{name}</span>{" "}
                      {tr("postingIn")}
                    </>
                  ) : (
                    <>
                      {tr("postingIn")} {" "}
                      <span className="font-bold capitalize text-slate-900 dark:text-themeTextWhite">{name}</span>
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
                onSuccess={() => setOpen(false)}
              />
            </div>
            {/* Fixed footer row inside DialogContent */}
            <div className="mt-2 border-t border-slate-200 dark:border-themeDarkGray pt-3 flex justify-end">
              <Button
                type="submit"
                form={formId}
                className="rounded-2xl bg-primary text-primary-foreground flex gap-x-2"
              >
                <Upload />
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
