"use client"

import { JoinButton } from "@/app/[locale]/(discover)/about/_components/join-button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useGroupInfo } from "@/hooks/groups"
import { cn, truncateString } from "@/lib/utils"
import { useLocale } from "next-intl"

export const GroupSideWidget = ({
  userid,
  light,
  groupid,
  hideGoToFeed,
}: {
  userid?: string
  light?: boolean
  groupid?: string
  hideGoToFeed?: boolean
}) => {
  const locale = useLocale()
  const { group, role, isLoading, hasError } = useGroupInfo(groupid, locale)

  const stripHtmlAndEntities = (html?: string | null) => {
    if (typeof html !== "string") return undefined
    // First strip HTML tags
    let text = html.replace(/<[^>]*>/g, " ")
    // Decode common HTML entities
    text = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
      .replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Normalize whitespace
    return text.replace(/\s+/g, " ").trim()
  }

  if (isLoading) return null
  if (hasError || !group) return null

  return (
    <Card
      className={cn(
        "border-themeGray/60 lg:sticky lg:top-0 mt-10 lg:mt-0 bg-[#161a20] rounded-xl overflow-hidden",
        light ? "bg-themeGray" : "",
      )}
    >
      <img
        src={`https://ucarecdn.com/${group.thumbnail}/`}
        alt="thumbnail"
        className="w-full aspect-video"
      />
      <div className="flex flex-col p-5 gap-y-2">
        <h2 className="font-bold text-lg">{group.name}</h2>
        <p className="text-sm text-themeTextGray">
          {truncateString(stripHtmlAndEntities(group.htmlDescription) || group.description || "")}
        </p>
      </div>
      <Separator orientation="horizontal" className="bg-themeGray/60" />
      {groupid && (
        <JoinButton
          groupid={groupid}
          owner={role === "OWNER" ? true : false}
          isMember={role === "MEMBER" ? true : false}
          hideGoToFeed={hideGoToFeed}
        />
      )}
    </Card>
  )
}
