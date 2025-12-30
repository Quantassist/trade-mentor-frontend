"use client"

import { Loader } from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMediaGallery } from "@/hooks/groups"
import { ErrorMessage } from "@hookform/error-message"
import { ImagePlus, Link2, Upload } from "lucide-react"

type MediaGalleryFormProps = {
  groupid: string
}

export const MediaGalleryForm = ({ groupid }: MediaGalleryFormProps) => {
  const { errors, register, onUpdateGallery, isPending } =
    useMediaGallery(groupid)
  return (
    <form onSubmit={onUpdateGallery} className="flex flex-col gap-y-5">
      {/* Video URL Input */}
      <div className="space-y-2">
        <Label htmlFor="videourl" className="text-sm font-medium text-slate-700 dark:text-white flex items-center gap-2">
          <Link2 className="w-4 h-4 text-emerald-500" />
          Video Link
        </Label>
        <Input
          id="videourl"
          type="text"
          placeholder="Paste YouTube or Loom URL..."
          className="bg-slate-100 dark:bg-themeBlack/60 border-slate-300 dark:border-themeGray/60 focus:border-emerald-500/60 rounded-lg h-11 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-themeTextGray/60"
          {...register("videourl")}
        />
        <ErrorMessage
          errors={errors}
          name="videourl"
          render={({ message }) => (
            <p className="text-red-400 text-sm">{message}</p>
          )}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200 dark:bg-themeGray/40" />
        <span className="text-xs text-slate-400 dark:text-themeTextGray uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-themeGray/40" />
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label htmlFor="media-gallery" className="text-sm font-medium text-slate-700 dark:text-white flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-emerald-500" />
          Upload Image
        </Label>
        <label
          htmlFor="media-gallery"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-themeGray/50 hover:border-emerald-500/50 rounded-xl bg-slate-100 dark:bg-themeBlack/40 hover:bg-slate-200 dark:hover:bg-themeBlack/60 cursor-pointer transition-all group"
        >
          <Input
            type="file"
            className="hidden"
            id="media-gallery"
            accept="image/*"
            multiple
            {...register("image")}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-slate-200 dark:bg-themeGray/30 group-hover:bg-emerald-500/20 transition-colors">
              <Upload className="w-5 h-5 text-slate-400 dark:text-themeTextGray group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-themeTextGray group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-slate-400 dark:text-themeTextGray/60 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </label>
        <ErrorMessage
          errors={errors}
          name="image"
          render={({ message }) => (
            <p className="text-red-400 text-sm">
              {message === "Required" ? "" : message}
            </p>
          )}
        />
      </div>

      {/* Submit Button */}
      <Button 
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-lg transition-all"
      >
        <Loader loading={isPending}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Media
        </Loader>
      </Button>
    </form>
  )
}
