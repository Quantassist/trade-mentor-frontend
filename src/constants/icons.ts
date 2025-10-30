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
  { id: "concept", label: "Concept", icon: "doc" },
  { id: "example", label: "Example", icon: "doc" },
  { id: "case_study", label: "Case Study", icon: "doc" },
  { id: "interactive", label: "Interactive", icon: "doc" },
  { id: "quiz", label: "Quiz", icon: "quiz" },
  { id: "reflection", label: "Reflection", icon: "reflection" },
  { id: "callout", label: "Callout", icon: "announcement" },
]
