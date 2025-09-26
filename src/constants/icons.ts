type IconListProps = {
  icon: string
  id: string
}

export const ICON_LIST: IconListProps[] = [
  {
    id: "0",
    icon: "general",
  },
  {
    id: "1",
    icon: "announcement",
  },
]

export type SectionTypeOption = {
  id: string
  label: string
  icon: string // key understood by IconRenderer
}

// Section types for course sections
export const SECTION_TYPES: SectionTypeOption[] = [
  { id: "video", label: "Video", icon: "video" },
  { id: "text", label: "Text", icon: "text" },
  { id: "resource", label: "Resources", icon: "resource" },
  { id: "reflection", label: "Reflection", icon: "reflection" },
  { id: "quiz", label: "Quiz", icon: "quiz" },
  { id: "assessment", label: "Assessment", icon: "assessment" },
]
