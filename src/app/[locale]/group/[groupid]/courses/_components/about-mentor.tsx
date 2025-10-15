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
      <Card className="border-themeGray/60 bg-[#161a20] rounded-xl p-5">
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
                <Avatar className="h-14 w-14 ring-1 ring-white/10 bg-themeGray/20">
                  <AvatarImage src={m.headshotUrl || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-xl font-semibold truncate">{m.displayName || "Mentor"}</p>
                    {m.role ? (
                      <span className="text-[10px] uppercase tracking-wide text-themeTextGray bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
                        {m.role}
                      </span>
                    ) : null}
                  </div>
                  {(m.title || m.organization) ? (
                    <p className="text-sm text-[#b9a9ff]">
                      {m.title}
                      {m.organization ? `, ${m.organization}` : ""}
                    </p>
                  ) : null}
                  {years !== null ? (
                    <p className="text-sm text-themeTextGray">{years} year{years === 1 ? "" : "s"} of experience</p>
                  ) : null}
                  {m.bio ? (
                    <p className="mt-3 text-sm text-themeTextWhite/90 leading-relaxed max-w-3xl">{m.bio}</p>
                  ) : null}
                  {socials.length > 0 ? (
                    <div className="flex flex-wrap gap-3 pt-2">
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
