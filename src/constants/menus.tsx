import { Chat, CreditCard, Explore, Home } from "@/icons"
import { GlobeIcon } from "@/icons/globe"
import { UsersIcon } from "@/icons/users-icon"
import { PuzzleIcon } from "@/icons/puzzle-icon"
import { Settings } from "@/icons/settings"
import { JSX } from "react"

export type MenuProps = {
  id: number
  label: string
  icon: JSX.Element
  path: string
  section?: boolean
  integration?: boolean
}

export type GroupMenuProps = {
  id: number
  label: string
  icon: JSX.Element
  path: string
}

export const LANDING_PAGE_MENU: MenuProps[] = [
  {
    id: 0,
    label: "Home",
    icon: <Home />,
    path: "/",
    section: true,
  },
  {
    id: 1,
    label: "Pricing",
    icon: <CreditCard />,
    path: "#pricing",
    section: true,
  },
  {
    id: 2,
    label: "Explore",
    icon: <Explore />,
    path: "/explore",
  },
]

export const GROUP_PAGE_MENU: GroupMenuProps[] = [
  {
    id: 0,
    label: "Feed",
    icon: <Home />,
    path: "feed",
  },
  {
    id: 1,
    label: "Courses",
    icon: <CreditCard />,
    path: "courses",
  },
  {
    id: 2,
    label: "Events",
    icon: <Explore />,
    path: "events",
  },
  // {
  //   id: 3,
  //   label: "Members",
  //   icon: <Explore />,
  //   path: "members",
  // },
  // {
  //   id: 5,
  //   label: "Huddle",
  //   icon: <Explore />,
  //   path: "huddle",
  // },
  {
    id: 3,
    label: "Leaderboard",
    icon: <Explore />,
    path: "leaderboard",
  },
  {
    id: 4,
    label: "About",
    icon: <Explore />,
    path: "about",
  },
]

export const SIDEBAR_MENU: MenuProps[] = [
  {
    id: 0,
    label: "General",
    icon: <></>,
    path: "/",
  },
]

export const USER_SETTINGS_MENU: MenuProps[] = [
  {
    id: 0,
    label: "Profile",
    icon: <Home />,
    path: "profile",
  },
  {
    id: 1,
    label: "Account",
    icon: <CreditCard />,
    path: "account",
  },
]

export const SIDEBAR_SETTINGS_MENU: MenuProps[] = [
  {
    id: 0,
    label: "General",
    icon: <Settings className="text-slate-600 dark:text-themeTextWhite" />,
    path: "general",
  },
  {
    id: 1,
    label: "Subscriptions",
    icon: <CreditCard className="text-slate-600 dark:text-themeTextWhite" />,
    path: "subscriptions",
  },
  {
    id: 2,
    label: "Affiliates",
    icon: <UsersIcon className="text-slate-600 dark:text-themeTextWhite" />,
    path: "affiliates",
  },
  {
    id: 3,
    label: "Domain Config",
    icon: <GlobeIcon className="text-slate-600 dark:text-themeTextWhite" />,
    path: "domains",
  },
  {
    id: 4,
    label: "Integration",
    icon: <PuzzleIcon className="text-slate-600 dark:text-themeTextWhite" />,
    path: "integrations",
  },
]
