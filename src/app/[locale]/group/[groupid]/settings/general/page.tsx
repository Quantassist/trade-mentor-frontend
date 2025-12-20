import { GroupSettingsForm } from "@/components/form/groups-settings";
import { getTranslations } from "next-intl/server";

const GroupPageSettings = async ({
  params,
}: {
  params: Promise<{ groupid: string; locale: string }>
}) => {
  const { groupid, locale } = await params
  const t = await getTranslations({ locale, namespace: "settings.general" })
  return (
    <div className="flex flex-col w-full h-full overflow-auto">
      {/* Header section */}
      <div className="border-b border-themeGray/30 px-6 py-6">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="text-sm text-themeTextGray mt-1">{t("description")}</p>
      </div>
      {/* Content section */}
      <div className="flex-1 px-6 py-6">
        <GroupSettingsForm groupId={groupid} />
      </div>
    </div>
  )
}

export default GroupPageSettings
