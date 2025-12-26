import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

type LeaderBoardCardProps = {
  light?: boolean
}

export const LeaderBoardCard = ({ light }: LeaderBoardCardProps) => {
  const t = useTranslations("leaderboard")
  
  return (
    <Card
      className={cn(
        "border-themeGray rounded-xl p-5 overflow-hidden",
        light ? "border-themeGray bg-[#1A1A1D]" : "bg-themeBlack",
      )}
    >
      <h2 className="text-themeTextWhite text-xl font-bold">
        {t("title")} ({t("period")})
      </h2>
      <p className="text-themeTextGray text-sm">
        {t("subtitle")}
      </p>
    </Card>
  )
}
