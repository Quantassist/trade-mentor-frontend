"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

type MentorItem = {
  displayName?: string | null
  title?: string | null
  headshotUrl?: string | null
  role?: string | null
  organization?: string | null
  bio?: string | null
  experienceStartYear?: string | Date | null
  socials?: any
}

export function AboutMentor({ mentors }: { mentors: MentorItem[] }) {
  const list = Array.isArray(mentors) ? mentors : []
  if (list.length === 0) return null
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Meet your Mentor{list.length > 1 ? "s" : ""}</h3>
      <Card className="border-themeGray bg-[#121315] rounded-xl p-5">
        <div className="flex flex-col gap-5">
          {list.map((m, idx) => {
            const initials = (m.displayName || "?")
              .split(" ")
              .map((s) => s[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
            const start = m.experienceStartYear ? new Date(m.experienceStartYear as any) : null
            const years = start && !isNaN(start.getTime()) ? Math.max(0, new Date().getFullYear() - start.getFullYear()) : null
            const socials: { label: string; url: string }[] = []
            try {
              if (m.socials && typeof m.socials === "object") {
                const obj = m.socials as Record<string, any>
                for (const [key, val] of Object.entries(obj)) {
                  const url = typeof val === "string" ? val : (val && typeof val.url === "string" ? val.url : null)
                  if (url) socials.push({ label: key, url })
                }
              }
            } catch {}
            return (
              <div key={idx} className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={m.headshotUrl || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-white font-medium">
                    {m.displayName || "Mentor"}
                    {m.role ? <span className="ml-2 text-xs text-themeTextGray">({m.role})</span> : null}
                  </p>
                  {(m.title || m.organization) ? (
                    <p className="text-xs text-themeTextGray">
                      {[m.title, m.organization].filter(Boolean).join(" • ")}
                      {years !== null ? <span>{` • ${years} year${years === 1 ? "" : "s"} of experience`}</span> : null}
                    </p>
                  ) : years !== null ? (
                    <p className="text-xs text-themeTextGray">{years} year{years === 1 ? "" : "s"} of experience</p>
                  ) : null}
                  {m.bio ? (
                    <p className="text-sm text-themeTextWhite/90 max-w-3xl leading-relaxed">{m.bio}</p>
                  ) : null}
                  {socials.length > 0 ? (
                    <div className="flex flex-wrap gap-3 pt-1">
                      {socials.map((s, i) => (
                        <a key={i} href={s.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                          {s.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
