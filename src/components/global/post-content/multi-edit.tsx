"use client"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BlockTextEditor from "@/components/global/rich-text-editor"
import { locales, defaultLocale } from "@/i18n/config"
import { JSONContent } from "novel"
import React, { useEffect, useState } from "react"
import { useEditChannelPostMulti } from "@/hooks/channels"

export type LocalePayload = {
  locale: string
  title?: string
  htmlcontent?: string | null
  jsoncontent?: string | null
  content?: string | null
}

type MultiPostEditContentProps = {
  postid: string
  formId?: string
}

export const MultiPostEditContent = ({ postid, formId }: MultiPostEditContentProps) => {
  const [active, setActive] = useState<string>(defaultLocale)
  const {
    // rhf-like
    errors,
    onSubmitEdit,
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
    isLoading,
  } = useEditChannelPostMulti(postid)

  useEffect(() => {
    // Ensure default tab is valid even if locales change
    if (!locales.includes(active as any)) setActive(defaultLocale)
  }, [active])

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>
  }

  return (
    <form id={formId} onSubmit={onSubmitEdit} className="flex flex-col w-full flex-1 overflow-auto gap-y-4">
      <Tabs value={active} onValueChange={setActive} className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="self-start">
          {locales.map((l) => (
            <TabsTrigger key={l} value={l} className="capitalize">
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
        {locales.map((l) => (
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
      <button type="submit" disabled={isPending} className="hidden" />
    </form>
  )
}

export default MultiPostEditContent
