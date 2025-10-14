"use client"
import { useLocale, useTranslations } from "next-intl"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type PostAuthorProps = {
  image?: string
  username?: string
  channel: string
}

export const PostAuthor = ({ image, username, channel }: PostAuthorProps) => {
  const tr = useTranslations("channel")
  const currentLocale = useLocale()
  return (
    <div className="flex items-center gap-x-3">
      <Avatar className="cursor-pointer">
        <AvatarImage src={image} alt="user" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <p className="text-themeTextGray text-sm capitalize">{username}</p>
        <p className="text-sm text-themeTextGray capitalize">
          {currentLocale === "hi" ? (
            <>
              <span className="font-bold capitalize text-themeTextWhite">{channel}</span>{" "}
              {tr("postingIn")}
            </>
          ) : (
            <>
              {tr("postingIn")} {" "}
              <span className="font-bold capitalize text-themeTextWhite">{channel}</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
