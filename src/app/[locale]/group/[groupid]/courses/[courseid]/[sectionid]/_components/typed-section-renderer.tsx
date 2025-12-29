import type { SectionType } from "@/types/sections"
import CalloutView from "./CalloutView"
import CaseStudyView from "./CaseStudyView"
import ExampleView from "./ExampleView"
import InteractiveView from "./InteractiveView"
import QuizView from "./QuizView"
import ReflectionView from "./ReflectionView"

type Props = { type?: SectionType | string; payload?: any; sectionid: string; groupid: string; locale?: string; user?: any; initial?: any }

export default function TypedSectionRenderer({ type, payload, sectionid, groupid, locale, user, initial }: Props) {
  if (!type) return <div className="p-5 text-slate-500 dark:text-themeTextGray">No section type</div>
  switch (type) {
    case "example":
      return <ExampleView payload={(payload || {}) as any} sectionid={sectionid} groupid={groupid} locale={locale} initial={initial} />
    case "case_study":
      return <CaseStudyView payload={(payload || {}) as any} sectionid={sectionid} groupid={groupid} locale={locale} initial={initial} />
    case "interactive":
      return <InteractiveView payload={(payload || {}) as any} sectionid={sectionid} groupid={groupid} locale={locale} initial={initial} />
    case "quiz":
      return <QuizView payload={(payload || {}) as any} sectionid={sectionid} groupid={groupid} locale={locale} user={user} initial={initial} />
    case "reflection":
      return <ReflectionView payload={(payload || {}) as any} sectionid={sectionid} groupid={groupid} locale={locale} user={user} initial={initial} />
    case "callout":
      return <CalloutView payload={payload} />
    default:
      return <div className="p-5 text-slate-500 dark:text-themeTextGray">Unsupported section type</div>
  }
}
