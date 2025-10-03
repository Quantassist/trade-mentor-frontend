import { onAuthenticatedUser } from "@/actions/auth"
import { BackdropGradient } from "@/components/global/backdrop-gradient"
import { GroupListSlider } from "@/components/global/group-list-slider"
import { Link } from "@/i18n/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import React from "react"
import { ExploreHeader } from "./_components/explore-header"
import { ExploreSearch } from "./_components/explore-search"

type ExploreLayoutProps = { children: React.ReactNode; params: Promise<{ locale: string }> }

const ExploreLayout = async ({ children, params }: ExploreLayoutProps) => {
  // const locale = await getLocale()
  const { locale } = await params
  setRequestLocale(locale)
  const user = await onAuthenticatedUser()
  // Keep server locale binding for any future server-side needs
  await getTranslations("explore")
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex flex-col items-center mt-36 px-10">
        <ExploreHeader createHref={user.status === 200 ? `/group/create/${user.id}` : "/sign-in"} />
        <BackdropGradient
          className="w-4/12 md:w-5/12 xl:w-3/12 xl:h-2/6 h-3/6"
          container="items-center"
        >
          <ExploreSearch />
          <div className="w-full md:w-[800px]">
            <GroupListSlider overlay route />
          </div>
        </BackdropGradient>
      </div>
      {children}
    </div>
  )
}

export default ExploreLayout
