import { mergeAttributes, Node } from "@tiptap/core"

export const Video = Node.create({
  name: "video",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  parseHTML() {
    return [
      {
        tag: "iframe",
      },
    ]
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null as number | null,
        parseHTML: (el) => {
          const styleWidth = (el as HTMLElement).style?.width
          const attrWidth = (el as HTMLElement).getAttribute("width")
          const px = styleWidth?.endsWith("px")
            ? parseInt(styleWidth)
            : undefined
          return px ?? (attrWidth ? parseInt(attrWidth) : null)
        },
        renderHTML: (attrs) => {
          const widthStyle = attrs.width
            ? `width: ${attrs.width}px;`
            : "width: 100%;"
          // ensure consistent sizing anywhere we render this HTML
          return { style: `${widthStyle} height: auto; aspect-ratio: 16 / 9;` }
        },
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ["iframe", mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ({ editor, node, getPos }) => {
      const wrapper = document.createElement("div")
      wrapper.className =
        "tiptap-video-wrapper relative inline-block max-w-full" +
        (editor.isEditable ? " cursor-default" : "")
      wrapper.style.display = "inline-block"
      wrapper.style.position = "relative"
      wrapper.style.maxWidth = "100%"
      if (node.attrs.width) {
        wrapper.style.width = `${node.attrs.width}px`
      }

      const iframe = document.createElement("iframe")
      iframe.src = node.attrs.src
      iframe.title = node.attrs.title ?? "video"
      iframe.style.width = "100%"
      iframe.style.height = "auto"
      ;(iframe.style as any).aspectRatio = "16 / 9"
      iframe.allowFullscreen = true
      iframe.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      )

      // Create two prominent circular side handles (left and right)
      const handleLeft = document.createElement("div")
      const handleRight = document.createElement("div")

      const baseHandleStyle = (el: HTMLDivElement) => {
        el.className =
          "tiptap-video-resize-handle tiptap-video-resize-handle--side"
        el.style.position = "absolute"
        el.style.width = "14px"
        el.style.height = "14px"
        el.style.border = "2px solid #ffffff"
        el.style.borderRadius = "9999px"
        el.style.background = "transparent"
        el.style.boxShadow = "0 0 0 2px rgba(59,130,246,0.6)" // subtle blue outline like reference
        el.style.cursor = "ew-resize"
        el.style.zIndex = "5"
      }
      baseHandleStyle(handleLeft)
      baseHandleStyle(handleRight)

      // Position handles at vertical center of left and right edges
      handleLeft.style.left = "-10px"
      handleLeft.style.top = "50%"
      handleLeft.style.transform = "translateY(-50%)"

      handleRight.style.right = "-10px"
      handleRight.style.top = "50%"
      handleRight.style.transform = "translateY(-50%)"

      let pointerId: number | null = null
      let startX = 0
      let startWidth = 0
      let dragging = false
      let direction: "left" | "right" = "right"

      const clamp = (n: number, min: number, max: number) =>
        Math.max(min, Math.min(max, n))

      const onPointerMove = (e: PointerEvent) => {
        if (!dragging) return
        // Only respond to the active pointer
        if (pointerId !== null && e.pointerId !== pointerId) return

        const delta = e.clientX - startX
        const signedDelta = direction === "right" ? delta : -delta
        const parentWidth =
          wrapper.parentElement?.getBoundingClientRect().width ?? Infinity
        const newWidth = clamp(
          Math.round(startWidth + signedDelta),
          120,
          parentWidth,
        )
        wrapper.style.width = `${newWidth}px`
        // Note: we commit on pointerup to avoid thrashing transactions
      }

      const commitWidth = (widthPx: number) => {
        const { state, dispatch } = editor.view
        const pos = typeof getPos === "function" ? getPos() : null
        if (pos == null) return
        const tr = state.tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          width: Math.round(widthPx),
        })
        dispatch(tr)
      }

      const endDrag = () => {
        if (!dragging) return
        dragging = false
        const finalWidth = parseInt(wrapper.style.width.replace("px", ""))
        if (!Number.isNaN(finalWidth)) {
          commitWidth(finalWidth)
        }
        // Cleanup listeners
        window.removeEventListener("pointermove", onPointerMove)
        window.removeEventListener("pointerup", onPointerUp)
        window.removeEventListener("pointercancel", onPointerCancel)
      }

      const onPointerUp = (e: PointerEvent) => {
        if (pointerId !== null && e.pointerId !== pointerId) return
        // Release capture and finalize
        try {
          ;(e.target as Element)?.releasePointerCapture?.(e.pointerId)
        } catch {}
        endDrag()
        pointerId = null
      }
      const onPointerCancel = (e: PointerEvent) => {
        if (pointerId !== null && e.pointerId !== pointerId) return
        try {
          ;(e.target as Element)?.releasePointerCapture?.(e.pointerId)
        } catch {}
        endDrag()
        pointerId = null
      }

      const startDrag = (e: PointerEvent, which: "left" | "right") => {
        if (!editor.isEditable) return
        e.preventDefault()
        direction = which
        dragging = true
        pointerId = e.pointerId
        startX = e.clientX
        startWidth = wrapper.getBoundingClientRect().width

        // Capture the pointer so we always get the up event
        try {
          ;(e.target as Element)?.setPointerCapture?.(e.pointerId)
        } catch {}

        // Register global listeners once dragging begins
        window.addEventListener("pointermove", onPointerMove, { passive: true })
        window.addEventListener("pointerup", onPointerUp, { passive: true })
        window.addEventListener("pointercancel", onPointerCancel, {
          passive: true,
        })
      }

      handleLeft.addEventListener("pointerdown", (e) => startDrag(e, "left"))
      handleRight.addEventListener("pointerdown", (e) => startDrag(e, "right"))

      wrapper.appendChild(iframe)
      if (editor.isEditable) {
        wrapper.appendChild(handleLeft)
        wrapper.appendChild(handleRight)
      }

      // Initial width if not present: fit container reasonably and persist
      if (!node.attrs.width) {
        requestAnimationFrame(() => {
          const parentWidth =
            wrapper.parentElement?.getBoundingClientRect().width || 0
          const fallback = clamp(
            Math.round(parentWidth),
            240,
            parentWidth || 99999,
          )
          if (fallback > 0) {
            wrapper.style.width = `${fallback}px`
            const { state, dispatch } = editor.view
            const pos = typeof getPos === "function" ? getPos() : null
            if (pos != null) {
              const tr = state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                width: fallback,
              })
              dispatch(tr)
            }
          }
        })
      }

      return {
        dom: wrapper,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "video") return false
          iframe.src = updatedNode.attrs.src
          if (updatedNode.attrs.title) iframe.title = updatedNode.attrs.title
          if (updatedNode.attrs.width)
            wrapper.style.width = `${updatedNode.attrs.width}px`
          return true
        },
        destroy: () => {
          window.removeEventListener("pointermove", onPointerMove)
          window.removeEventListener("pointerup", onPointerUp)
          window.removeEventListener("pointercancel", onPointerCancel)
          handleLeft.replaceWith()
          handleRight.replaceWith()
        },
      }
    }
  },
})
