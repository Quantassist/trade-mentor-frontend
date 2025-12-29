"use client"
import React from "react"
import { HtmlParser } from "./html-parser"

// Minimal markdown -> HTML converter for headings, bold/italic, lists, code blocks, and paragraphs.
// Not exhaustive, but covers our payload needs. Keep it client-only and safe.
function mdToHtml(md?: string): string {
  if (!md) return ""
  let html = md.replace(/\r\n?/g, "\n")

  // Escape basic HTML to avoid injection; allow simple markdown we add next
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Fenced code blocks ```lang\ncode\n```
  html = html.replace(/```[\s\S]*?```/g, (block) => {
    const inner = block.replace(/^```[a-zA-Z0-9_-]*\n?|```$/g, "")
    return `<pre class="rounded-md border border-slate-200 dark:border-themeGray/60 bg-slate-100 dark:bg-black/40 p-3 overflow-x-auto"><code class="text-slate-800 dark:text-themeTextWhite">${inner}</code></pre>`
  })

  // Headings #, ##, ### (line-start)
  html = html.replace(/^###\s*(.*)$/gm, '<h3 class="mt-4 mb-2 text-xl font-semibold text-slate-900 dark:text-themeTextWhite">$1</h3>')
  html = html.replace(/^##\s*(.*)$/gm, '<h2 class="mt-5 mb-3 text-2xl font-semibold text-slate-900 dark:text-themeTextWhite">$1</h2>')
  html = html.replace(/^#\s*(.*)$/gm, '<h1 class="mt-6 mb-4 text-3xl font-bold text-slate-900 dark:text-themeTextWhite">$1</h1>')

  // Images ![alt](src "title") to <img>
  html = html.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g, (_m, alt, src, title) => {
    const rawAlt = String(alt || "")
    const sizeMatch = rawAlt.split("|")[1]?.match(/^(\d+)\s*x\s*(\d+)$/i)
    const a = rawAlt.split("|")[0]?.replace(/"/g, "&quot;") ?? ""
    const s = String(src || "")
    const t = title ? ` title="${String(title).replace(/"/g, "&quot;")}"` : ""
    const w = sizeMatch ? sizeMatch[1] : ""
    const h = sizeMatch ? sizeMatch[2] : ""
    const dw = w ? ` data-w="${w}"` : ""
    const dh = h ? ` data-h="${h}"` : ""
    return `<img src="${s}" alt="${a}"${t}${dw}${dh} />`
  })

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1<\/strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1<\/em>')

  // Unordered list items (- or *) to <li>; wrap consecutive groups with <ul>
  html = html.replace(/^(?:[-*])\s+(.*)$/gm, '<li>$1</li>')
  html = html.replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, (list) => `<ul class="list-disc pl-6 space-y-1">${list}</ul>`)

  // Preserve runs of 3+ newlines as additional empty paragraphs using a placeholder
  html = html.replace(/\n{3,}/g, (m) => "\n\n" + "¶\n\n".repeat(m.length - 2))

  // Line breaks to paragraphs where appropriate
  const lines = html.split(/\n{2,}/)
  html = lines
    .map((chunk) =>
      chunk === "¶"
        ? `<div class="h-6 not-prose" aria-hidden="true"></div>`
        : /<\/?(h1|h2|h3|ul|li|pre|code)/.test(chunk)
        ? chunk
        : `<p class="text-slate-700 dark:text-themeTextWhite leading-7">${chunk.replace(/\n/g, '<br/>')}</p>`,
    )
    .join("\n")

  return html
}

export function Markdown({ children }: { children?: string }) {
  const html = mdToHtml(children)
  return <HtmlParser html={html} />
}
