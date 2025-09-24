"use client"

import BlockTextEditor from "@/components/global/rich-text-editor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useNewPostForm } from "@/hooks/groups"
import { Upload } from "@/icons"

type NewPostFormProps = {
  user: {
    name: string
    imageUrl: string
    id: string
  }
  setOpen: (open: boolean) => void
}

const NewPostForm = ({ user, setOpen }: NewPostFormProps) => {
  const {
    content,
    setContent,
    textContent,
    setTextContent,
    htmlContent,
    setHtmlContent,
    channel,
    setChannel,
    groupInfo,
    isPending,
    onSubmit,
    errors,
    register,
    status,
  } = useNewPostForm()

  status == "success" || status == "pending" ? setOpen(false) : null

  const channels = groupInfo?.group?.channel

  return (
    <div>
      <div className="flex items-center mb-4 gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user?.imageUrl!} />
          <AvatarFallback>{user?.name!}</AvatarFallback>
        </Avatar>
        <div className="text-gray-400 font-normal">
          <div className="text-sm">{user?.name!}</div>
          <div className="text-sm">
            Posting in{" "}
            <span className="text-white font-medium">
              {channel?.name ?? "Channel Name"}
            </span>{" "}
          </div>
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <BlockTextEditor
          content={content}
          setContent={setContent}
          min={150}
          max={10000}
          name="postContent"
          errors={{}}
          textContent={textContent}
          setTextContent={setTextContent}
          htmlContent={htmlContent}
          setHtmlContent={setHtmlContent}
        />
        <div className="w-full flex justify-between items-center">
          <Select
            onValueChange={(value) => {
              setChannel(
                channels?.find((channel) => channel.id === value) ?? channel,
              )
            }}
            value={channel?.id}
            {...register("channelId")}
          >
            <SelectTrigger className="w-[180px] bg-themeBlack rounded-lg border-themeGray hover:bg-themeGray">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent className="bg-themeBlack">
              {channels?.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="submit"
            className="bg-white rounded-2xl flex gap-2 hover:bg-gray-300"
          >
            <Upload />
            Upload
          </Button>
        </div>

        {errors && (
          <div className="text-red-400 mt-2">
            {errors.channelId?.message}
            {errors.jsondescription?.message}
            {errors.htmldescription?.message}
          </div>
        )}
      </form>
    </div>
  )
}

export default NewPostForm
