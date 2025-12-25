import { Card } from "@/components/ui/card"
import { truncateString } from "@/lib/utils"
import Link from "next/link"

type GroupStateProps = {
  id: string
  slug?: string
  name: string
  category: string
  createdAt: Date
  userId: string
  thumbnail: string | null
  description: string | null
  privacy: "PUBLIC" | "PRIVATE"
  preview?: string
}

export const GroupCard = ({
  id,
  slug,
  userId,
  thumbnail,
  name,
  category,
  description,
  privacy,
  preview,
}: GroupStateProps) => {
  //using image tag because image component from next has a bug with cdn images

  return (
    <Link href={`/about/${slug || id}`}>
      <Card className="bg-themeBlack border-themeGray rounded-xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 hover:border-themeGray/80">
        <div className="overflow-hidden">
          <img
            src={preview || `https://ucarecdn.com/${thumbnail}/`}
            alt="thumbnail"
            className="w-full opacity-70 aspect-video object-cover transition-all duration-300 group-hover:opacity-90 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg text-white font-bold group-hover:text-[#d4f0e7] transition-colors">{name}</h3>
          <p className="text-sm text-themeTextGray mt-1">
            {description && truncateString(description)}
          </p>
        </div>
      </Card>
    </Link>
  )
}
