import { GroupSettingsForm } from "@/components/form/groups-settings"
import { getTranslations } from "next-intl/server"

const GroupPageSettings = async ({
  params,
}: {
  params: Promise<{ groupid: string; locale: string }>
}) => {
  const { groupid, locale } = await params
  const t = await getTranslations({ locale, namespace: "settings.general" })
  return (
    <div className="flex flex-col w-full h-full gap-10 px-16 py-10 overflow-auto">
      <div className="flex flex-col">
        <h3 className="text-3xl font-bold">{t("title")}</h3>
        <p className="text-sm text-themeTextGray">{t("description")}</p>
      </div>
      <GroupSettingsForm groupId={groupid} />
    </div>
  )
}

export default GroupPageSettings
