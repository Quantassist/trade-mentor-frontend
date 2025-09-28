import { onGetAffiliateLink } from "@/actions/groups"
import { CopyButton } from "@/components/global/copy-button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { getTranslations } from "next-intl/server"

type Props = {
  params: Promise<{ groupid: string; locale: string }>
}

const Affiliates = async ({ params }: Props) => {
  const { groupid, locale } = await params
  const t = await getTranslations({ locale, namespace: "settings.affiliates" })
  const affiliate = await onGetAffiliateLink(groupid)
  return (
    <div className="flex flex-col items-start p-5">
      <Card className="border-themeGray bg-[#1A1A1D] p-5">
        <CardTitle className="text-3xl">{t("title")}</CardTitle>
        <CardDescription className="text-themeTextGray">{t("description")}</CardDescription>
        <div className="flex flex-col mt-8 gap-y-2">
          <div className="bg-black border-themeGray p-3 rounded-lg flex gap-x-5 items-center">
            {process.env.NEXT_PUBLIC_BASE_URL}/affiliates/
            {affiliate.affiliate?.id}
            <CopyButton
              content={`${process.env.NEXT_PUBLIC_BASE_URL}/affiliates/${affiliate.affiliate?.id}`}
            />
          </div>
          <CardDescription className="text-themeTextGray">{t("note")}</CardDescription>
        </div>
      </Card>
    </div>
  )
}
export default Affiliates
