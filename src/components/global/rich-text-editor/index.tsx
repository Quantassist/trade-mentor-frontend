"use client"
import { cn } from "@/lib/utils"
import { ErrorMessage } from "@hookform/error-message"
// import Placeholder from "@tiptap/extension-placeholder"
import { EditorBubble, EditorCommand, EditorCommandEmpty, EditorCommandItem, EditorContent, EditorRoot, handleCommandNavigation, JSONContent } from "novel"

// import { CharacterCount, handleCommandNavigation } from "novel/extensions"
import { upload } from "@/lib/uploadcare"
import { createImageUpload, handleImageDrop, handleImagePaste } from "novel"
import { useMemo, useState } from "react"
import { FieldErrors } from "react-hook-form"
import { HtmlParser } from "../html-parser"
import { ColorSelector } from "./color-selector"
import { defaultExtensions } from "./extensions"
import { LinkSelector } from "./link-selector"
import { NodeSelector } from "./node-selector"
import { slashCommand, suggestionItems } from "./slash-command"
import { TextButtons } from "./text-selector"
import { Video } from "./video"

type BlockTextEditorProps = {
  content: JSONContent | undefined
  setContent: React.Dispatch<React.SetStateAction<JSONContent | undefined>>
  min: number
  max: number
  name: string
  errors: FieldErrors
  textContent: string | undefined
  setTextContent: React.Dispatch<React.SetStateAction<string | undefined>>
  onEdit?: boolean
  inline?: boolean
  disabled?: boolean
  htmlContent?: string | undefined
  setHtmlContent?: React.Dispatch<React.SetStateAction<string | undefined>>
}

const BlockTextEditor = ({
  setContent,
  content,
  min,
  max,
  name,
  errors,
  setTextContent,
  textContent,
  onEdit,
  inline,
  disabled,
  htmlContent,
  setHtmlContent,
}: BlockTextEditorProps) => {
  const [openNode, setOpenNode] = useState<boolean>(false)
  const [openLink, setOpenLink] = useState<boolean>(false)
  const [openColor, setOpenColor] = useState<boolean>(false)
  const [characters, setCharacters] = useState<number | undefined>(
    textContent?.length || undefined,
  )

  const extensionsList = useMemo(
    () => [
      ...defaultExtensions,
      slashCommand,
      // Do not enforce a hard character cap to avoid trimming initial content.
      // CharacterCount from novel appears to enforce the limit and can drop leading content.
      Video as any,
    ],
    [],
  )

  // Image upload handler for paste/drag events (memoized)
  const uploadFn = useMemo(
    () =>
      createImageUpload({
        onUpload: async (file: File) => {
          const uploaded = await upload.uploadFile(file)
          return `https://ucarecdn.com/${uploaded.uuid}/`
        },
        validateFn: (file: File) => {
          if (!file.type.includes("image/")) return false
          if (file.size / 1024 / 1024 > 20) return false
          return true
        },
      }),
    [],
  )

  return (
    <div>
      {htmlContent && !onEdit && inline ? (
        <HtmlParser html={htmlContent} />
      ) : (
        <EditorRoot>
          <EditorContent
            immediatelyRender={false}
            className={cn(
              inline
                ? onEdit && "mb-5"
                : "border-[1px] rounded-xl px-10 py-5 text-base border-themeGray bg-themeBlack w-full",
            )}
            editorProps={{
              editable: () => !disabled as boolean,
              handlePaste: (view, event) =>
                handleImagePaste(view, event as ClipboardEvent, uploadFn),
              handleDrop: (view, event, _slice, moved) =>
                handleImageDrop(view, event as DragEvent, moved, uploadFn),
              handleDOMEvents: {
                keydown: (_view, event) => handleCommandNavigation(event),
              },
              attributes: {
                class: `prose prose-lg dark:prose-invert focus:outline-none max-w-full [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:text-2xl [&_h3]:font-semibold text-themeTextGray`,
              },
            }}
            extensions={extensionsList}
            initialContent={content}
            onUpdate={({ editor }) => {
              const json = editor.getJSON()
              const text = editor.getText()

              if (setHtmlContent) {
                const html = editor.getHTML()
                setHtmlContent(html)
              }
              setContent(json)
              setTextContent(text)
              setCharacters(text.length)
            }}
          >
            {!onEdit && !content && (
              <p className="text-themeTextGray text-lg">
                Type / to insert element
              </p>
            )}
            <EditorCommand
              className="z-[9999] h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
              onWheel={(e) => {
                e.stopPropagation()
              }}
            >
              <EditorCommandEmpty className="px-2 text-muted-foreground">
                No results
              </EditorCommandEmpty>
              {suggestionItems.map((item: any) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command(val)}
                  className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommand>
            <EditorBubble
              tippyOptions={{
                placement: "top",
              }}
              className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-themeBlack text-themeTextGray shadow-xl"
            >
              <NodeSelector open={openNode} onOpenChange={setOpenNode} />
              <LinkSelector open={openLink} onOpenChange={setOpenLink} />
              <TextButtons />
              <ColorSelector open={openColor} onOpenChange={setOpenColor} />
            </EditorBubble>
          </EditorContent>
          {inline ? (
            onEdit && (
              <div className="flex justify-between py-2">
                <p
                  className={cn(
                    "text-xs",
                    characters && characters > max && "text-red-500",
                  )}
                >
                  {characters || 0} / {max}
                </p>
                <ErrorMessage
                  errors={errors}
                  name={name}
                  render={({ message }) => (
                    <p className="text-red-400 mt-2">
                      {message === "Required" ? "" : message}
                    </p>
                  )}
                />
              </div>
            )
          ) : (
            <div className="flex justify-between py-2">
              <p
                className={cn(
                  "text-xs",
                  characters && characters > max && "text-red-500",
                )}
              >
                {characters} / {max}
              </p>
              <ErrorMessage
                errors={errors}
                name={name}
                render={({ message }) => (
                  <p className="text-red-400 mt-2">
                    {message === "Required" ? "" : message}
                  </p>
                )}
              />
            </div>
          )}
        </EditorRoot>
      )}
    </div>
  )
}
export default BlockTextEditor
