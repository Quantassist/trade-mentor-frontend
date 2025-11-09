"use client"
import React, { useEffect, useMemo, useState } from "react"
import type { InteractiveBlockPayload } from "@/types/sections"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import InteractiveContentForm from "@/components/form/interactive"
import InteractiveRunnerForm from "@/components/form/interactive/runner"
import { useCourseSectionInfo, useGroupRole } from "@/hooks/courses"
import SectionAnchors from "@/components/anchors/section-anchors"
import { useRunner } from "react-runner"

type Props = {
  payload: InteractiveBlockPayload
  sectionid: string
  groupid: string
  locale?: string
  initial?: any
}

export default function InteractiveView({ payload, sectionid, groupid, locale, initial }: Props) {
  const { data } = useCourseSectionInfo(sectionid, locale, initial)
  const { canEdit } = useGroupRole(groupid)
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'html' | 'react'>('html')
  const moduleId = (data?.section?.Module?.id as string) || undefined
  const anchorIds = Array.isArray((data as any)?.section?.anchorIds) ? (data as any).section.anchorIds : []

  const html = useMemo(() => (data as any)?.section?.htmlContent as string | undefined, [data])
  const runner = useMemo(() => {
    const raw = (data as any)?.section?.jsonContent
    let jc: any = raw
    try { if (typeof raw === 'string') jc = JSON.parse(raw) } catch {}
    const r = jc?.interactiveRunner
    return r && typeof r === 'object' ? r as { code?: string; meta?: any } : undefined
  }, [data])

  // Prefer React tab if runner code present
  React.useEffect(() => {
    if (runner?.code) setActiveTab('react')
    else setActiveTab('html')
  }, [runner?.code])

  // Build react-runner scope with strict allowlist imports and locale
  const allowedLibs: string[] = useMemo(
    () => (Array.isArray(runner?.meta?.allowed_libraries) ? runner!.meta!.allowed_libraries : []),
    [runner?.meta?.allowed_libraries],
  )
  const scopeConfig: any = useMemo(() => (runner?.meta?.scope_config || {}), [runner?.meta?.scope_config])
  const [runnerScope, setRunnerScope] = useState<any | null>(null)
  const [libsLoading, setLibsLoading] = useState<boolean>(false)

  useEffect(() => {
    let cancelled = false
    async function build() {
      setLibsLoading(true)
      try {
        const importMap: Record<string, any> = {}
        for (const lib of allowedLibs) {
          if (lib === 'lucide-react') {
            importMap['lucide-react'] = await import('lucide-react')
          } else if (lib === 'dayjs') {
            const mod = await import('dayjs')
            importMap['dayjs'] = mod.default ?? mod
          } else if (lib === 'classnames') {
            const mod = await import('classnames')
            importMap['classnames'] = mod.default ?? mod
          } else if (lib === 'clsx') {
            const mod = await import('clsx')
            importMap['clsx'] = mod.default ?? mod
          } else if (lib === 'framer-motion') {
            importMap['framer-motion'] = await import('framer-motion')
          } else if (lib === 'three') {
            importMap['three'] = await import('three')
          } else if (lib === '@react-three/fiber') {
            importMap['@react-three/fiber'] = await import('@react-three/fiber')
          } else if (lib === '@react-three/drei') {
            importMap['@react-three/drei'] = await import('@react-three/drei')
          } else if (lib === 'recharts') {
            importMap['recharts'] = await import('recharts')
          }
        }
        if (!cancelled) {
          setRunnerScope({ React, locale, ...scopeConfig, import: importMap })
        }
      } finally {
        if (!cancelled) setLibsLoading(false)
      }
    }
    // Even if no libs, we still want base scope
    setRunnerScope({ React, locale, ...scopeConfig, import: {} })
    if (allowedLibs.length > 0) build()
    return () => { cancelled = true }
  }, [allowedLibs.join(','), locale, JSON.stringify(scopeConfig)])

  const code = (runner?.code && runner.code.trim()) ? runner.code : '() => null'
  const { element, error } = useRunner({ code, scope: runnerScope || { React, locale, ...scopeConfig, import: {} } })

  return (
    <>
      <div className="p-5 md:p-6 space-y-4">
        <SectionAnchors moduleId={moduleId} anchorIds={anchorIds} />
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Interactive Demo</h2>
          {canEdit && (
            <Button type="button" className="rounded-md px-3 py-1.5 text-sm text-white bg-[#4F46E5] hover:bg-[#4F46E5]/90 ring-1 ring-[#4F46E5]/30" onClick={() => setEditOpen(true)}>
              Edit section
            </Button>
          )}
        </div>

        {/* React mode takes precedence if code exists */}
        {runner?.code ? (
          <div className="rounded-lg border border-themeGray/60 bg-[#0f0f14] p-4 text-themeTextWhite">
            <div className="text-sm text-themeTextGray mb-2">Preview (React)</div>
            <div className="rounded-md border border-themeGray/60 p-4 bg-[#12151b]">
              {libsLoading ? (
                <div className="text-themeTextGray text-sm">Loading libraries...</div>
              ) : (
                <>
                  <div className="mb-2">{element}</div>
                  {error && (
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-red-400 bg-black/40 p-2 rounded border border-red-900/40 overflow-auto">
                      {String(error)}
                    </pre>
                  )}
                </>
              )}
            </div>
          </div>
        ) : html ? (
          <div className="relative w-full overflow-hidden rounded-lg border border-themeGray/60 bg-[#0f0f14]" style={{ paddingTop: "56.25%" }}>
            <iframe
              title="Interactive Demo"
              className="absolute inset-0 h-full w-full"
              sandbox="allow-scripts allow-forms"
              srcDoc={(html || '').replaceAll('{{LOCALE}}', (locale || '') as string)}
              loading="lazy"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-themeGray/60 bg-[#0f0f14] p-6 text-center text-themeTextGray">
            No content yet. {canEdit ? "Click Edit section to add HTML or React code." : ""}
          </div>
        )}
      </div>

      {canEdit && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-[#161a20] border border-themeGray/60 text-themeTextWhite">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Interactive</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 mb-4">
              <Button type="button" variant={activeTab === 'html' ? 'default' : 'ghost'} className={activeTab === 'html' ? 'bg-[#4F46E5] text-white' : 'text-themeTextGray'} onClick={() => setActiveTab('html')}>HTML</Button>
              <Button type="button" variant={activeTab === 'react' ? 'default' : 'ghost'} className={activeTab === 'react' ? 'bg-[#4F46E5] text-white' : 'text-themeTextGray'} onClick={() => setActiveTab('react')}>React</Button>
            </div>

            {activeTab === 'html' ? (
              <InteractiveContentForm
                groupid={groupid}
                sectionid={sectionid}
                locale={locale}
                initialHtml={html}
                onCancel={() => setEditOpen(false)}
              />
            ) : (
              <InteractiveRunnerForm
                groupid={groupid}
                sectionid={sectionid}
                locale={locale}
                initial={runner}
                onCancel={() => setEditOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
