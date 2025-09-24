import {
  HorizontalRule,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TiptapLink,
  TiptapUnderline,
  UploadImagesPlugin,
} from "novel"

import { Extension } from "@tiptap/core"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import TextStyle from "@tiptap/extension-text-style"
import { cx } from "class-variance-authority"
import AutoJoiner from "tiptap-extension-auto-joiner"
import GlobalDragHandle from "tiptap-extension-global-drag-handle"
import { Image } from "./image"

// Keep drag/paste upload experience with our custom Image node by adding the upload plugin as a standalone extension
const uploadImages = Extension.create({
  name: "uploadImages",
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cx("opacity-40 rounded-lg border border-stone-200"),
      }),
    ]
  },
})

// You can overwrite the placeholder with your own configuration
const placeholder = Placeholder.configure({
  placeholder: "Type / to insert element...",
})
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
})

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2"),
  },
})
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex items-start my-4"),
  },
  nested: true,
})

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-muted-foreground"),
  },
})

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx("list-disc list-outside leading-3 -mt-2 pl-6"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 -mt-2 pl-6"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx("rounded-sm bg-muted border p-5 font-mono font-medium"),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx("rounded-md bg-muted  px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
})

export const defaultExtensions = [
  GlobalDragHandle,
  AutoJoiner.configure({ elementsToJoin: ["bulletList", "orderedList"] }),
  starterKit,
  placeholder,
  tiptapLink,
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  Image,
  taskList,
  taskItem,
  horizontalRule,
  uploadImages,
  TiptapUnderline,
]
