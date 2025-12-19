import {
  BarChart3,
  BookOpen,
  Landmark,
  LineChart,
  PiggyBank,
  RefreshCcw,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { JSX } from "react"

export type GroupListProps = {
  id: string
  label: string
  icon: JSX.Element
  path: string
}

export const GROUP_LIST: GroupListProps[] = [
  {
    id: "0",
    label: "All",
    icon: <RefreshCcw />,
    path: "",
  },
  {
    id: "1",
    label: "Technical Analysis",
    icon: <TrendingUp />,
    path: "technical-analysis",
  },
  {
    id: "2",
    label: "Fundamental Analysis",
    icon: <BarChart3 />,
    path: "fundamental-analysis",
  },
  {
    id: "3",
    label: "Personal Finance",
    icon: <Wallet />,
    path: "personal-finance",
  },
  {
    id: "4",
    label: "Investing",
    icon: <PiggyBank />,
    path: "investing",
  },
  {
    id: "5",
    label: "Trading Strategies",
    icon: <LineChart />,
    path: "trading-strategies",
  },
  {
    id: "6",
    label: "Market Basics",
    icon: <Landmark />,
    path: "market-basics",
  },
  {
    id: "7",
    label: "Financial Literacy",
    icon: <BookOpen />,
    path: "financial-literacy",
  },
  {
    id: "8",
    label: "Risk Management",
    icon: <Target />,
    path: "risk-management",
  },
]
