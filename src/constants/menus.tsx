import { Chat, CreditCard, Explore, Home } from "@/icons"
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
    label: "Home",
    icon: <Home />,
    path: "home",
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

export const SIDEBAR_SETTINGS_MENU: MenuProps[] = [
  {
    id: 0,
    label: "General",
    // icon: <IDuotoneBlack />,
    icon: <Chat />,
    path: "general",
  },
  {
    id: 1,
    label: "Subscriptions",
    icon: <CreditCard />,
    path: "subscriptions",
  },
  {
    id: 2,
    label: "Affiliates",
    // icon: <AffiliateDuoToneBlack />,
    icon: <Chat />,
    path: "affiliates",
  },
  {
    id: 3,
    label: "Domain Config",
    icon: <Chat />,
    // icon: <GlobalDuoToneBlack/>,
    path: "domains",
  },
  {
    id: 4,
    label: "Integration",
    // icon: <ZapDuoToneBlack/>,
    icon: <Chat />,
    path: "integrations",
  },
]
