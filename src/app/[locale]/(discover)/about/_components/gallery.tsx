"use client"

import { MediaGalleryForm } from "@/components/form/media-gallery"
import { GlassModal } from "@/components/global/glass-modal"
import { Card, CardContent } from "@/components/ui/card"
import { BadgePlus } from "@/icons"
import { validateURLString } from "@/lib/utils"

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
  return (
    <div className="flex justify-start gap-3 flex-wrap">
      {gallery.length > 0 &&
        gallery.map((gal, key) =>
          validateURLString(gal).type === "IMAGE" ? (
            <img
              onClick={() =>
                onActive({
                  url: gal,
                  type: "IMAGE",
                })
              }
              key={key}
              src={`https://ucarecdn.com/${gal}/`}
              alt="gallery-img"
              className="aspect-video w-36 rounded-xl cursor-pointer opacity-70"
            />
          ) : validateURLString(gal).type === "LOOM" ? (
            <div
              key={key}
              className="w-36 aspect-video relative cursor-pointer opacity-70"
            >
              <div
                className="w-full h-full absolute z-50"
                onClick={() =>
                  onActive({
                    url: gal,
                    type: "LOOM",
                  })
                }
              ></div>
              <iframe
                src={gal}
                className="absolute outline-none border-0 top-0 left-0 w-full h-full rounded-xl"
              ></iframe>
            </div>
          ) : (
            <div
              key={key}
              className="w-36 aspect-video relative opacity-70 cursor-pointer"
            >
              <div
                className="w-full h-full absolute z-50"
                onClick={() =>
                  onActive({
                    url: gal,
                    type: "YOUTUBE",
                  })
                }
              ></div>
              <iframe
                className="w-full absolute top-0 left-0 h-full rounded-xl"
                src={gal}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          ),
        )}
      {userid === groupUserId ? (
        <GlassModal
          title="Add media to VSL"
          description="Paste a link to a youtube or a loom video."
          trigger={
            <Card className="border-dashed border-themeGray hover:bg-themeBlack bg-transparent cursor-pointer">
              <CardContent className="flex justify-center items-center py-10 px-16">
                <BadgePlus />
              </CardContent>
            </Card>
          }
        >
          <MediaGalleryForm groupid={groupid} />
        </GlassModal>
      ) : null}
    </div>
  )
}
