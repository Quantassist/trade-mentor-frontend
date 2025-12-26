"use client"

import { GroupCard } from "@/app/[locale]/(discover)/explore/_components/group-card"
import { Loader } from "@/components/global/loader"
import BlockTextEditor from "@/components/global/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useGroupSettings } from "@/hooks/groups"
import { Globe, Lock } from "lucide-react"

type GroupSettingsFormProps = {
  groupId: string
}

export const GroupSettingsForm = ({ groupId }: GroupSettingsFormProps) => {
  const {
    data,
    register,
    errors,
    onUpdate,
    isPending,
    previewIcon,
    previewThumbnail,
    onJsonDescription,
    setJsonDescription,
    setOnDescription,
    onDescription,
    isPrivate,
    onTogglePrivacy,
    isTogglingPrivacy,
  } = useGroupSettings(groupId)

  // console.log("Group setting data", data)

  return (
    <form
      className="flex flex-col h-full w-full gap-6 max-w-4xl"
      onSubmit={onUpdate}
    >
      {/* Cover Image Section */}
      <div className="bg-[#161a20] border border-themeGray/60 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Cover Image</h3>
            <p className="text-xs text-themeTextGray mt-0.5">Displayed on your group card</p>
          </div>
          <Label
            htmlFor="thumbnail-upload"
            className="text-sm px-4 py-2 bg-themeGray border border-themeGray/80 text-white rounded-lg hover:bg-themeGray/80 cursor-pointer transition-colors"
          >
            <Input
              type="file"
              id="thumbnail-upload"
              className="hidden"
              {...register("thumbnail")}
            />
            Change Cover
          </Label>
        </div>
        <div className="rounded-lg overflow-hidden max-w-md">
          <GroupCard
            id={data?.group?.id!}
            createdAt={data?.group?.createdAt!}
            userId={data?.group?.userId!}
            category={data?.group?.category!}
            description={data?.group?.description!}
            privacy={data?.group?.privacy!}
            thumbnail={data?.group?.thumbnail!}
            name={data?.group?.name!}
            preview={previewThumbnail}
          />
        </div>
      </div>

      {/* Group Icon Section */}
      <div className="bg-[#161a20] border border-themeGray/60 rounded-xl p-5">
        <div className="flex items-center gap-6">
          <img
            className="w-20 h-20 rounded-xl object-cover ring-2 ring-white/10 shrink-0"
            src={
              previewIcon ||
              (data?.group?.icon &&
                `https://ucarecdn.com/${data?.group?.icon}/`) ||
              "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg"
            }
            alt="icon"
          />
          <div className="flex flex-col gap-2">
            <div>
              <h3 className="text-base font-semibold text-white">Group Icon</h3>
              <p className="text-xs text-themeTextGray mt-0.5">Square image, recommended 200x200px</p>
            </div>
            <Label
              className="text-sm px-4 py-2 bg-themeGray border border-themeGray/80 text-white rounded-lg cursor-pointer hover:bg-themeGray/80 transition-colors w-fit"
              htmlFor="icon-upload"
            >
              <Input
                type="file"
                id="icon-upload"
                className="hidden"
                {...register("icon")}
              />
              Change Icon
            </Label>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-[#161a20] border border-themeGray/60 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isPrivate ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
              {isPrivate ? (
                <Lock className="h-5 w-5 text-amber-400" />
              ) : (
                <Globe className="h-5 w-5 text-emerald-400" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {isPrivate ? "Private Group" : "Public Group"}
              </h3>
              <p className="text-xs text-themeTextGray mt-0.5">
                {isPrivate 
                  ? "Only members can see content and join by invitation" 
                  : "Anyone can discover and join this group"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-themeTextGray">
              {isPrivate ? "Private" : "Public"}
            </span>
            <Switch
              checked={isPrivate}
              onCheckedChange={onTogglePrivacy}
              disabled={isTogglingPrivacy}
              className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-themeGray/60 data-[state=unchecked]:border data-[state=unchecked]:border-themeGray"
            />
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-[#161a20] border border-themeGray/60 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-5">Group Details</h3>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-themeTextGray">Group Name</Label>
            <Input
              {...register("name")}
              placeholder={data?.group?.name!}
              className="bg-[#1e2329] border-themeGray/60 text-white placeholder:text-themeTextGray/50 focus:border-[#d4f0e7]/50 focus:ring-[#d4f0e7]/20"
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-themeTextGray">Group Description</Label>
            <div className="bg-[#1e2329] border border-themeGray/60 rounded-lg overflow-hidden">
              <BlockTextEditor
                errors={errors}
                name="jsondescription"
                min={150}
                max={10000}
                textContent={onDescription}
                content={onJsonDescription}
                setContent={setJsonDescription}
                setTextContent={setOnDescription}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex">
        <Button 
          type="submit"
          className="bg-gradient-to-r from-[#d4f0e7] to-[#e8f5f0] text-[#1a1a1a] hover:from-[#c4e6db] hover:to-[#d8ebe5] font-medium px-6"
        >
          <Loader loading={isPending}>Save Changes</Loader>
        </Button>
      </div>
    </form>
  )
}
