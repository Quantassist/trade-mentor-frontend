import {
  FileDuoToneBlack,
  FileDuoToneWhite,
  Home,
  HomeDuoToneWhite,
  MegaPhoneDuoToneBlack,
  MegaPhoneDuoToneWhite,
} from "@/icons"
import { BookOpen, ClipboardCheck, FileText, HelpCircle, PenLine, Video } from "lucide-react"
// TODO: create icons for resource, reflection, quiz, assessment instead of using lucide icons
type IconRendererProps = {
  mode: "LIGHT" | "DARK"
  icon: string
}

export const IconRenderer = ({ mode, icon }: IconRendererProps) => {
  switch (icon) {
    case "general":
      return mode === "DARK" ? <Home /> : <HomeDuoToneWhite />
    case "announcement":
      return mode === "DARK" ? (
        <MegaPhoneDuoToneBlack />
      ) : (
        <MegaPhoneDuoToneWhite />
      )
    case "doc":
      return mode === "DARK" ? <FileDuoToneBlack /> : <FileDuoToneWhite />
    case "video":
      return <Video className="h-4 w-4" />
    case "text":
      return <FileText className="h-4 w-4" />
    case "resource":
      return <BookOpen className="h-4 w-4" />
    case "reflection":
      return <PenLine className="h-4 w-4" />
    case "quiz":
      return <HelpCircle className="h-4 w-4" />
    case "assessment":
      return <ClipboardCheck className="h-4 w-4" />
    default:
      return <></>
  }
}
