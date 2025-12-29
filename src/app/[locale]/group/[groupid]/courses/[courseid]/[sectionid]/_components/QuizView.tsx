"use client"
import QuizContentForm from "@/components/form/quiz/index"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCourseSectionInfo, useGroupRole, useSubmitQuizAttempt } from "@/hooks/courses"
import type { QuizBlockPayload } from "@/types/sections"
import { Lightbulb } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import SectionAnchors from "@/components/anchors/section-anchors"

type Props = { payload: QuizBlockPayload; sectionid: string; groupid: string; locale?: string; user?: any; initial?: any }

export default function QuizView({ payload, sectionid, groupid, locale, user, initial }: Props) {
  const [answers, setAnswers] = useState<Record<number, number | null>>({})
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const { canEdit } = useGroupRole(groupid)
  const [editOpen, setEditOpen] = useState(false)
  const { submitQuizAttempt, isPending: submitting } = useSubmitQuizAttempt(groupid, sectionid, locale)
  const { data } = useCourseSectionInfo(sectionid, locale, initial)

  const effective = (data?.section?.blockPayload as any) ?? payload
  const total = effective?.items?.length || 0
  const score = useMemo(() => {
    if (!Array.isArray(effective?.items)) return 0
    let s = 0
    effective.items.forEach((q: any, qi: number) => {
      const ai = answers[qi]
      if (ai != null && q.choices?.[ai]?.correct) s += 1
    })
    return s
  }, [answers, effective?.items])

  const title = (effective as any)?.block_title || effective?.quiz_type || "Quiz"
  const passThreshold = typeof effective?.pass_threshold === "number" ? effective!.pass_threshold : 70
  const typeLabel = ((effective?.quiz_type as string) || "quiz").replace(/_/g, " ")
  const typeBadge = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)
  const moduleId = (data?.section?.Module?.id as string) || undefined
  const anchorIds = Array.isArray((data as any)?.section?.anchorIds) ? (data as any).section.anchorIds : []

  // Prefill from last attempt, if any (from hydrated data first, fallback to user prop)
  useEffect(() => {
    const hydrated = (data as any)?.user?.lastAttempt
    const last = hydrated ?? user?.lastAttempt
    if (!last || !Array.isArray(last.selectedIndexes)) return
    const pre: Record<number, number | null> = {}
    for (let i = 0; i < last.selectedIndexes.length; i++) pre[i] = last.selectedIndexes[i]
    setAnswers(pre)
    // Show as submitted and reveal all for read-back
    setSubmitted(true)
    const all: Record<number, boolean> = {}
    for (let i = 0; i < (effective?.items?.length || 0); i++) all[i] = true
    setRevealed(all)
  }, [user?.lastAttempt, (data as any)?.user?.lastAttempt, effective?.items?.length])
  return (
    <>
      <div className="p-5 md:p-6 space-y-6">
        <SectionAnchors moduleId={moduleId} anchorIds={anchorIds} />
        <div className="flex items-center gap-4">
          <span className="rounded-full border border-slate-200 dark:border-themeGray/60 bg-slate-100 dark:bg-[#0f0f14] px-3 py-1.5 text-xs md:text-sm text-slate-500 dark:text-themeTextGray ring-1 ring-slate-200 dark:ring-white/5">{typeBadge}</span>
          <div className="mx-auto" />
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-slate-200 dark:border-themeGray/60 bg-slate-100 dark:bg-[#0f0f14] px-3 py-1.5 text-xs md:text-sm text-slate-500 dark:text-themeTextGray ring-1 ring-slate-200 dark:ring-white/5">Pass ≥ {passThreshold}%</span>
            {submitted && total > 0 && (
              <span
                className={
                  "rounded-full px-3 py-1.5 text-xs md:text-sm border shadow-sm " +
                  (((score / total) * 100) >= passThreshold
                    ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10 ring-1 ring-emerald-500/20"
                    : "border-red-500/40 text-red-300 bg-red-500/10 ring-1 ring-red-500/20")
                }
              >
                Score {score}/{total} · {((score / total) * 100).toFixed(0)}%
              </span>
            )}
          </div>
          {canEdit && (
            <Button type="button" className="rounded-md px-3 py-1.5 text-sm text-white bg-[#4F46E5] hover:bg-[#4F46E5]/90 ring-1 ring-[#4F46E5]/30"
              onClick={() => setEditOpen(true)}>
              Edit section
            </Button>
          )}
        </div>
      </div>

      {Array.isArray(effective?.items) && effective.items.length > 0 ? (
        <div className="space-y-5">
          {effective.items.map((q: any, idx: number) => {
            const sel = answers[idx] ?? null
            return (
              <div key={idx} className="rounded-xl border border-slate-200 dark:border-themeGray/60 bg-white dark:bg-[#161a20] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="font-medium text-slate-900 dark:text-themeTextWhite">Q{idx + 1}. {q.stem}</div>
                  {q.difficulty ? (
                    <span className="rounded-full border border-slate-200 dark:border-themeGray/60 bg-slate-100 dark:bg-[#0f0f14] px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500 dark:text-themeTextGray">
                      {q.difficulty}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  {q.choices?.map((c: any, i: number) => {
                    const chosen = sel === i
                    const isCorrect = c.correct
                    const showExplanation = submitted || revealed[idx]
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [idx]: i }))}
                        className={
                          "w-full text-left rounded-lg border px-3 py-2 transition " +
                          (chosen
                            ? "bg-primary/5 dark:bg-white/5 border-[#4F46E5]/40 ring-1 ring-[#4F46E5]/30"
                            : "bg-transparent border-slate-200 dark:border-themeGray/40 hover:bg-slate-100 dark:hover:bg-white/5")
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span className={"h-4 w-4 rounded-full border " + (chosen ? "bg-[#4F46E5]/30 border-[#4F46E5]" : "border-slate-300 dark:border-themeGray/60")}></span>
                          <span className="text-slate-700 dark:text-themeTextWhite">{c.text}</span>
                        </div>
                        {showExplanation && (
                          <div className={"mt-2 text-sm rounded-md p-2 " + (isCorrect ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300")}>
                            {c.explanation}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                {(submitted || revealed[idx]) && q.rationale && (
                  <div className="mt-3 rounded-lg border border-slate-200 dark:border-themeGray/60 bg-slate-50 dark:bg-[#12151b] p-3 relative">
                    <Lightbulb className="absolute right-2 top-2 h-4 w-4 text-[#b9a9ff] opacity-20" />
                    <div className="text-[10px] font-semibold tracking-wide text-[#b9a9ff] mb-1">WHY</div>
                    <div className="text-sm text-slate-600 dark:text-themeTextWhite/90">{q.rationale}</div>
                  </div>
                )}
                {(submitted || revealed[idx]) && Array.isArray(q.anchor_ids) && q.anchor_ids.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-themeTextGray">Refs: {q.anchor_ids.join(", ")}</div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-slate-500 dark:text-themeTextGray">No questions</div>
      )}

      {total > 0 && (
        <div className="flex items-center justify-end">
          {!submitted ? (
            <button
              type="button"
              disabled={submitting}
              onClick={async () => {
                const ordered: number[] = []
                for (let i = 0; i < total; i++) ordered.push(answers[i] ?? -1)
                await submitQuizAttempt(ordered)
                const next: Record<number, boolean> = {}
                for (let i = 0; i < total; i++) next[i] = true
                setRevealed(next)
                setSubmitted(true)
              }}
              className="rounded-lg px-4 py-2.5 text-sm md:text-base font-semibold text-white bg-[#4F46E5] hover:bg-[#4F46E5]/90 shadow-lg ring-1 ring-[#4F46E5]/30 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAnswers({})
                setSubmitted(false)
                setRevealed({})
              }}
              className="rounded-lg px-4 py-2.5 text-sm md:text-base font-semibold text-white bg-[#4F46E5] hover:bg-[#4F46E5]/90 shadow-lg ring-1 ring-[#4F46E5]/30"
            >
              Retry Quiz
            </button>
          )}
        </div>
      )}
    {canEdit && (
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white dark:bg-[#161a20] border border-slate-200 dark:border-themeGray/60 text-slate-700 dark:text-themeTextWhite">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-themeTextWhite">Edit Quiz</DialogTitle>
          </DialogHeader>
          <QuizContentForm
            groupid={groupid}
            sectionid={sectionid}
            locale={locale}
            initial={effective as any}
            initialTitle={(data as any)?.section?.name as string}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    )}
    </>
  )
}
