"use client"
import BlockTextEditor from "@/components/global/rich-text-editor"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEditChannelPostMulti } from "@/hooks/channels"
import { defaultLocale, locales } from "@/i18n/config"
import { JSONContent } from "novel"
import React, { useEffect, useState } from "react"

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
    return (
      <div className="p-6 space-y-4">
        <div className="h-10 bg-themeGray/40 rounded-lg animate-pulse w-1/3" />
        <div className="space-y-3">
          <div className="h-12 bg-themeGray/40 rounded-lg animate-pulse" />
          <div className="h-32 bg-themeGray/40 rounded-lg animate-pulse" />
        </div>
      </div>
    )
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
          <TabsContent key={l} value={l} className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-1.5">
              <label className="text-sm font-medium text-themeTextGray">
                Post Title
              </label>
              <Input
                placeholder="Enter your post title..."
                className="bg-brand-card-elevated border border-themeGray/60 rounded-lg px-3 py-2.5 text-xl text-white placeholder:text-themeTextGray/60 focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                value={titles[l] ?? ""}
                onChange={(e) => setTitles((prev) => ({ ...prev, [l]: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-y-1.5">
              <label className="text-sm font-medium text-themeTextGray">
                Post Content
              </label>
              <div className="bg-brand-card-elevated border border-themeGray/60 rounded-lg p-3">
                <BlockTextEditor
                  key={`editor-${l}-${isLoading}`}
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
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <button type="submit" disabled={isPending} className="hidden" />
    </form>
  )
}

export default MultiPostEditContent
