import { mergeAttributes, Node } from "@tiptap/core"

export const Image = Node.create({
  name: "image",
  group: "block",
  draggable: true,
  selectable: true,
  atom: true,

  parseHTML() {
    return [
      {
        tag: "img",
      },
    ]
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      class: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) return {}
          return { class: attributes.class }
        },
      },
      width: {
        // store as number of pixels; render as style width: {width}px
        default: null,
        parseHTML: (element) => {
          const styleWidth = (element as HTMLElement).style?.width
          const attrWidth = (element as HTMLElement).getAttribute("width")
          const px = styleWidth?.endsWith("px")
            ? parseInt(styleWidth)
            : undefined
          return px ?? (attrWidth ? parseInt(attrWidth) : null)
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return { style: `width: ${attributes.width}px; height: auto;` }
        },
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ({ editor, node, getPos }) => {
      const wrapper = document.createElement("div")
      wrapper.className =
        "tiptap-image-wrapper relative inline-block max-w-full" +
        (editor.isEditable ? " cursor-default" : "")
      wrapper.style.display = "inline-block"
      wrapper.style.position = "relative"
      wrapper.style.maxWidth = "100%"
      if (node.attrs.width) {
        wrapper.style.width = `${node.attrs.width}px`
      }

      const img = document.createElement("img")
      img.src = node.attrs.src
      if (node.attrs.alt) img.alt = node.attrs.alt
      if (node.attrs.title) img.title = node.attrs.title
      img.style.width = "100%"
      img.style.height = "auto"
      img.style.display = "block"
      // Merge provided classes without overwriting (preserve plugin/decorations classes)
      if (node.attrs.class) {
        node.attrs.class
          .toString()
          .split(/\s+/)
          .filter(Boolean)
          .forEach((c: string) => img.classList.add(c))
      }
      ;["rounded-lg", "border", "border-muted"].forEach((cls) => {
        if (!img.classList.contains(cls)) img.classList.add(cls)
      })

      // Two prominent circular side handles (left/right), like video
      const handleLeft = document.createElement("div")
      const handleRight = document.createElement("div")

      const baseHandleStyle = (el: HTMLDivElement) => {
        el.className =
          "tiptap-image-resize-handle tiptap-image-resize-handle--side"
        el.style.position = "absolute"
        el.style.width = "14px"
        el.style.height = "14px"
        el.style.border = "2px solid #ffffff"
        el.style.borderRadius = "9999px"
        el.style.background = "transparent"
        el.style.boxShadow = "0 0 0 2px rgba(59,130,246,0.6)" // subtle blue outline
        el.style.cursor = "ew-resize"
        el.style.zIndex = "5"
      }
      baseHandleStyle(handleLeft)
      baseHandleStyle(handleRight)

      // Position at vertical center of left and right edges
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
        if (pointerId !== null && e.pointerId !== pointerId) return
        const delta = e.clientX - startX
        const signedDelta = direction === "right" ? delta : -delta
        const parentWidth =
          wrapper.parentElement?.getBoundingClientRect().width ?? Infinity
        const newWidth = clamp(
          Math.round(startWidth + signedDelta),
          50,
          parentWidth,
        )
        wrapper.style.width = `${newWidth}px`
        // Commit on pointerup only
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
        window.removeEventListener("pointermove", onPointerMove)
        window.removeEventListener("pointerup", onPointerUp)
        window.removeEventListener("pointercancel", onPointerCancel)
        pointerId = null
      }

      const onPointerUp = (e: PointerEvent) => {
        if (pointerId !== null && e.pointerId !== pointerId) return
        try {
          ;(e.target as Element)?.releasePointerCapture?.(e.pointerId)
        } catch {}
        endDrag()
      }
      const onPointerCancel = (e: PointerEvent) => {
        if (pointerId !== null && e.pointerId !== pointerId) return
        try {
          ;(e.target as Element)?.releasePointerCapture?.(e.pointerId)
        } catch {}
        endDrag()
      }

      const startDrag = (e: PointerEvent, which: "left" | "right") => {
        if (!editor.isEditable) return
        e.preventDefault()
        direction = which
        dragging = true
        pointerId = e.pointerId
        startX = e.clientX
        startWidth = wrapper.getBoundingClientRect().width

        try {
          ;(e.target as Element)?.setPointerCapture?.(e.pointerId)
        } catch {}

        window.addEventListener("pointermove", onPointerMove, { passive: true })
        window.addEventListener("pointerup", onPointerUp, { passive: true })
        window.addEventListener("pointercancel", onPointerCancel, {
          passive: true,
        })
      }

      handleLeft.addEventListener("pointerdown", (e) => startDrag(e, "left"))
      handleRight.addEventListener("pointerdown", (e) => startDrag(e, "right"))

      wrapper.appendChild(img)
      if (editor.isEditable) {
        wrapper.appendChild(handleLeft)
        wrapper.appendChild(handleRight)
      }

      // If no explicit width set, set initial width to natural or container width and persist
      if (!node.attrs.width) {
        img.addEventListener(
          "load",
          () => {
            const parentWidth =
              wrapper.parentElement?.getBoundingClientRect().width ||
              img.naturalWidth ||
              0
            const target = clamp(
              Math.min(img.naturalWidth || 0, parentWidth),
              50,
              parentWidth || 99999,
            )
            if (target > 0) {
              wrapper.style.width = `${target}px`
              const { state, dispatch } = editor.view
              const pos = typeof getPos === "function" ? getPos() : null
              if (pos != null) {
                const tr = state.tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  width: Math.round(target),
                })
                dispatch(tr)
              }
            }
          },
          { once: true },
        )
      }

      return {
        dom: wrapper,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "image") return false
          img.src = updatedNode.attrs.src
          if (updatedNode.attrs.alt) img.alt = updatedNode.attrs.alt
          if (updatedNode.attrs.title) img.title = updatedNode.attrs.title
          if (updatedNode.attrs.width) {
            wrapper.style.width = `${updatedNode.attrs.width}px`
          }
          // Merge provided classes without overwriting (preserve plugin/decorations classes)
          if (updatedNode.attrs.class) {
            updatedNode.attrs.class
              .toString()
              .split(/\s+/)
              .filter(Boolean)
              .forEach((c: string) => img.classList.add(c))
          }
          ;["rounded-lg", "border", "border-muted"].forEach((cls) => {
            if (!img.classList.contains(cls)) img.classList.add(cls)
          })
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
