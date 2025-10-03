"use client"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BlockTextEditor from "@/components/global/rich-text-editor"
import { locales, defaultLocale } from "@/i18n/config"
import { JSONContent } from "novel"
import React, { useState } from "react"
import { useCreateChannelPostMulti } from "@/hooks/channels"

export type LocalePayload = {
  locale: string
  title?: string
  htmlcontent?: string | null
  jsoncontent?: string | null
  content?: string | null
}

type MultiPostContentProps = {
  channelid: string
  formId?: string
  hideTabs?: boolean
  forceLocale?: string
}

export const MultiPostContent = ({ channelid, formId, hideTabs, forceLocale }: MultiPostContentProps) => {
  const initial = forceLocale ?? defaultLocale
  const [active, setActive] = useState<string>(initial)
  const {
    // rhf-like
    errors,
    onSubmitMulti,
    // per-locale states
    titles,
    setTitles,
    jsonByLocale,
    setJsonByLocale,
    htmlByLocale,
    setHtmlByLocale,
    textByLocale,
    setTextByLocale,
    isPending,
  } = useCreateChannelPostMulti(channelid)

  const localesToRender = forceLocale ? [forceLocale] : (locales as readonly string[])

  return (
    <form id={formId} onSubmit={onSubmitMulti} className="flex flex-col w-full flex-1 overflow-auto gap-y-4">
      <Tabs value={active} onValueChange={setActive} className="w-full flex-1 flex flex-col min-h-0">
        {!hideTabs && (
          <TabsList className="self-start">
            {localesToRender.map((l) => (
              <TabsTrigger key={l} value={l} className="capitalize">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
        {localesToRender.map((l) => (
          <TabsContent key={l} value={l} className="flex flex-col gap-y-3">
            <Input
              placeholder={`Title (${l})`}
              className="bg-transparent outline-none border-none text-2xl p-0"
              value={titles[l] ?? ""}
              onChange={(e) => setTitles((prev) => ({ ...prev, [l]: e.target.value }))}
            />
            <BlockTextEditor
              errors={errors as any}
              name={`jsoncontent-${l}`}
              min={0}
              max={10000}
              inline
              onEdit
              textContent={textByLocale[l]}
              setTextContent={((value: React.SetStateAction<string | undefined>) => {
                setTextByLocale((prev) => ({
                  ...prev,
                  [l]: typeof value === "function" ? (value as any)(prev[l]) : value,
                }))
              }) as React.Dispatch<React.SetStateAction<string | undefined>>}
              content={jsonByLocale[l] as JSONContent | undefined}
              setContent={((value: React.SetStateAction<JSONContent | undefined>) => {
                setJsonByLocale((prev) => ({
                  ...prev,
                  [l]: typeof value === "function" ? (value as any)(prev[l]) : value,
                }))
              }) as React.Dispatch<React.SetStateAction<JSONContent | undefined>>}
              htmlContent={htmlByLocale[l]}
              setHtmlContent={((value: React.SetStateAction<string | undefined>) => {
                setHtmlByLocale((prev) => ({
                  ...prev,
                  [l]: typeof value === "function" ? (value as any)(prev[l]) : value,
                }))
              }) as React.Dispatch<React.SetStateAction<string | undefined>>}
            />
          </TabsContent>
        ))}
      </Tabs>
      {/* hidden submit to allow parent Dialog footer button to submit via form attribute */}
      <button type="submit" disabled={isPending} className="hidden" />
    </form>
  )
}

export default MultiPostContent
