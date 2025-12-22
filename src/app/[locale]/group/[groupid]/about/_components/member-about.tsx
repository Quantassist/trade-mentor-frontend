"use client"

import { GroupSideWidget } from "@/components/global/group-side-widget"
import { HtmlParser } from "@/components/global/html-parser"
import { Loader } from "@/components/global/loader"
import BlockTextEditor from "@/components/global/rich-text-editor"
import { NoResult } from "@/components/global/search/no-result"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGroupAbout, useGroupInfo } from "@/hooks/groups"
import { Calendar, Shield, Users } from "lucide-react"
import { MediaGallery } from "./gallery"

type MemberAboutGroupProps = {
  userid: string
  groupid: string
  locale: string
}

export const MemberAboutGroup = ({ userid, groupid, locale }: MemberAboutGroupProps) => {
  const { group, role, isLoading, hasError } = useGroupInfo(groupid, locale)

  const {
    setJsonDescription,
    setOnDescription,
    onDescription,
    onJsonDescription,
    errors,
    onEditDescription,
    editor,
    activeMedia,
    onSetActiveMedia,
    onUpdateDescription,
    isPending,
    setOnHtmlDescription,
  } = useGroupAbout(
    group?.description ?? null,
    group?.jsonDescription ?? null,
    group?.htmlDescription ?? null,
    group?.gallery?.[0] ?? "",
    groupid,
    locale,
  )

  if (isLoading) {
    return (
      <Loader loading={true}>
        <div />
      </Loader>
    )
  }

  if (hasError || !group) {
    return (
      <div>
        <NoResult />
      </div>
    )
  }

  const isOwner = role === "OWNER"
  const isMember = role === "MEMBER"

  return (
    <div className="flex flex-col gap-y-8">
      {/* Group Name Header */}
      <div>
        <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
          {group.name}
        </h1>
      </div>

      {/* Main Content Grid - Video/Image and Side Widget on same level */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Media */}
        <div className="lg:col-span-2">
          {group.gallery.length > 0 && (
            <div className="relative rounded-xl overflow-hidden">
              {activeMedia?.type === "IMAGE" ? (
                <img
                  src={`https://ucarecdn.com/${activeMedia.url}/`}
                  alt="group-img"
                  className="w-full aspect-video object-cover rounded-xl"
                />
              ) : activeMedia?.type === "LOOM" ? (
                <div className="w-full aspect-video relative">
                  <iframe
                    src={activeMedia.url}
                    allowFullScreen
                    className="absolute outline-none border-0 top-0 left-0 w-full h-full rounded-xl"
                  ></iframe>
                </div>
              ) : (
                activeMedia?.type === "YOUTUBE" && (
                  <div className="w-full aspect-video relative">
                    <iframe
                      className="w-full absolute top-0 left-0 h-full rounded-xl"
                      src={activeMedia.url}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                )
              )}
            </div>
          )}
          
          {/* Media Gallery - show if owner (to add) or has items */}
          {(group.gallery.length > 0 || userid === group.userId) && (
            <div className="mt-6">
              <MediaGallery
                gallery={group.gallery}
                groupid={groupid}
                groupUserId={group.userId}
                userid={userid}
                onActive={onSetActiveMedia}
              />
            </div>
          )}
        </div>

        {/* Right Column - Group Info Card */}
        <div className="lg:col-span-1">
          <GroupSideWidget userid={userid} groupid={groupid} hideGoToFeed />
        </div>
      </div>

      {/* Member-Only Section - Membership Details */}
      <div className="mt-4">
        <h2 className="text-2xl font-semibold text-white mb-4">Your Membership</h2>
        <Card className="bg-[#161a20] rounded-xl p-6 border border-themeGray/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Role Badge */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-themeTextGray">Your Role</p>
                <p className="text-lg font-semibold text-white capitalize">
                  {isOwner ? (
                    <span className="text-amber-400">Owner</span>
                  ) : (
                    <span className="text-emerald-400">Member</span>
                  )}
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-themeTextGray">Member Since</p>
                <p className="text-lg font-semibold text-white">
                  {new Date(group.createdAt).toLocaleDateString(locale, {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Group Privacy */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-themeTextGray">Group Type</p>
                <p className="text-lg font-semibold text-white">
                  {group.privacy ? "Private" : "Public"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Description Section */}
      <div className="mt-4">
        <h2 className="text-2xl font-semibold text-white mb-4">About this group</h2>
        <div className="bg-[#161a20] rounded-xl p-6 border border-themeGray/60">
          {userid !== group.userId ? (
            <HtmlParser html={group.htmlDescription || "<p>No description available.</p>"} />
          ) : (
            <form
              ref={editor}
              onSubmit={onUpdateDescription}
              className="flex flex-col"
            >
              <BlockTextEditor
                onEdit={onEditDescription}
                max={10000}
                inline
                min={100}
                disabled={userid === group.userId ? false : true}
                name="jsondescription"
                errors={errors}
                setContent={setJsonDescription}
                content={onJsonDescription}
                htmlContent={group.htmlDescription as string | undefined}
                setHtmlContent={setOnHtmlDescription}
                textContent={onDescription}
                setTextContent={setOnDescription}
              />
              {onEditDescription && (
                <Button
                  className="self-end bg-themeBlack border-themeGray px-10 mt-4"
                  variant={"outline"}
                  disabled={isPending}
                  type="submit"
                >
                  <Loader loading={isPending}>Update</Loader>
                </Button>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Owner-Only Section - Quick Stats */}
      {isOwner && (
        <div className="mt-4">
          <h2 className="text-2xl font-semibold text-white mb-4">Group Statistics</h2>
          <Card className="bg-[#161a20] rounded-xl p-6 border border-themeGray/60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-themeTextGray mb-1">Category</p>
                <p className="text-lg font-medium text-white capitalize">{group.category}</p>
              </div>
              <div>
                <p className="text-sm text-themeTextGray mb-1">Created</p>
                <p className="text-lg font-medium text-white">
                  {new Date(group.createdAt).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-themeTextGray mb-1">Gallery Items</p>
                <p className="text-lg font-medium text-white">{group.gallery?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-themeTextGray mb-1">Privacy</p>
                <p className="text-lg font-medium text-white">{group.privacy ? "Private" : "Public"}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
