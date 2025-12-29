"use client"

import { MediaGalleryForm } from "@/components/form/media-gallery"
import { GlassModal } from "@/components/global/glass-modal"
import { useDeleteGalleryItem } from "@/hooks/groups"
import { validateURLString } from "@/lib/utils"
import { Loader2, Plus, X } from "lucide-react"

type MediaGalleryProps = {
  gallery: string[]
  groupid: string
  groupUserId: string
  userid: string
  onActive(media: { url: string | undefined; type: string }): void
}

export const MediaGallery = ({
  gallery,
  groupid,
  groupUserId,
  userid,
  onActive,
}: MediaGalleryProps) => {
  const { deleteGalleryItem, isDeleting } = useDeleteGalleryItem(groupid)
  const isOwner = userid === groupUserId

  const handleDelete = (e: React.MouseEvent, mediaUrl: string) => {
    e.stopPropagation()
    if (isDeleting) return
    deleteGalleryItem(mediaUrl)
  }

  return (
    <div className="flex justify-start gap-3 flex-wrap items-center">
      {gallery.length > 0 &&
        gallery.map((gal, key) => {
          const mediaType = validateURLString(gal).type
          
          return (
            <div
              key={key}
              className="relative group w-28 aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-100 opacity-80 transition-all border border-slate-200 dark:border-themeGray/40 hover:border-slate-300 dark:hover:border-themeGray"
            >
              {/* Delete button - only for owner */}
              {isOwner && (
                <button
                  onClick={(e) => handleDelete(e, gal)}
                  disabled={isDeleting}
                  className="absolute top-1 right-1 z-20 w-5 h-5 rounded-full bg-black/70 hover:bg-red-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove media"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  ) : (
                    <X className="w-3 h-3 text-white" />
                  )}
                </button>
              )}
              
              {mediaType === "IMAGE" ? (
                <img
                  onClick={() => onActive({ url: gal, type: "IMAGE" })}
                  src={`https://ucarecdn.com/${gal}/`}
                  alt="gallery-img"
                  className="w-full h-full object-cover"
                />
              ) : mediaType === "LOOM" ? (
                <>
                  <div
                    className="w-full h-full absolute z-10"
                    onClick={() => onActive({ url: gal, type: "LOOM" })}
                  />
                  <iframe
                    src={gal}
                    className="absolute outline-none border-0 top-0 left-0 w-full h-full"
                  />
                </>
              ) : (
                <>
                  <div
                    className="w-full h-full absolute z-10"
                    onClick={() => onActive({ url: gal, type: "YOUTUBE" })}
                  />
                  <iframe
                    className="w-full absolute top-0 left-0 h-full"
                    src={gal}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </>
              )}
            </div>
          )
        })}
      
      {/* Add media button - only for owner */}
      {isOwner && (
        <GlassModal
          title="Add Media"
          description="Add a video link or upload an image to your gallery"
          trigger={
            <div className="w-28 aspect-video rounded-lg border-2 border-dashed border-slate-300 dark:border-themeGray/60 hover:border-emerald-500/60 bg-slate-100 dark:bg-themeBlack/50 hover:bg-slate-50 dark:hover:bg-themeBlack cursor-pointer flex items-center justify-center transition-all group">
              <Plus className="w-6 h-6 text-slate-400 dark:text-themeTextGray group-hover:text-emerald-400 transition-colors" />
            </div>
          }
        >
          <MediaGalleryForm groupid={groupid} />
        </GlassModal>
      )}
    </div>
  )
}
