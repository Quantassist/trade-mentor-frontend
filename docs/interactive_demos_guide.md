# Building Interactive Demos with React Runner

Audience: Developers authoring interactive React components that render in Interactive sections.

Last updated: Oct 2025

---

## 1) Overview

Interactive React demos are executed with react-runner inside the app. Each section can render either:
- HTML mode: sandboxed iframe using `sections.htmlContent`.
- React mode: TSX/JSX stored in `section.jsonContent.interactiveRunner.code` with metadata.

Your component is evaluated in a strict scope. You must import any libraries you use (that are in the allowlist), and you can read variables injected by the host (e.g., `locale`).

---

## 2) Authoring conventions

- Export a default React component; no props are passed.
- Import from allowed libraries explicitly at the top.
- Use Tailwind classes freely for styling.
- Avoid referencing `window`/`document` directly; prefer React/DOM APIs via libraries.
- Keep side effects minimal (no global mutations).

Minimal template:

```tsx
export default function Demo() {
  return <div className="p-4 text-themeTextWhite">Hello {locale}</div>
}
```

---

## 3) Variables injected into scope

The runner exposes the following top-level identifiers to your code:
- `React` — React itself and hooks (e.g., `React.useState`).
- `locale` — current user locale (string).
- All key/value pairs from “Scope config (JSON)” in the Edit dialog.
  - Example Scope config JSON:
    ```json
    { "appCurrency": "INR", "uiTheme": "dark", "minYears": 3 }
    ```
  - In code you can reference: `appCurrency`, `uiTheme`, `minYears` directly.

Notes:
- Scope config is NOT an import mechanism; it’s only for plain variables.
- Use unambiguous names (e.g., `appCurrency`) to avoid collisions.

---

## 4) Allowed libraries and imports

You must list libraries in “Allowed libraries” AND import them in your code.

Starter allowlist (enabled):
- `lucide-react` — icons
- `dayjs` — date utility
- `classnames`, `clsx` — class composition
- `framer-motion` — animations/gestures
- `recharts` — charts (pragmatic choice)
- `three`, `@react-three/fiber`, `@react-three/drei` — 3D

Example imports:
```tsx
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
```

Extending the allowlist (maintainers):
1) Install the package in the app.
2) Add its name to the server allowlist in `src/actions/courses.ts` (inside `onUpdateInteractiveRunner`).
3) Add a dynamic import branch in `InteractiveView.tsx` scope builder (`build()` function).
4) Authors can then include it in “Allowed libraries” and import it in code.

---

## 5) Layout and sizing (critical for charts/3D)

Many visualization libs render nothing if their container reports width/height = 0 at first render. Recharts’ `ResponsiveContainer` is a common example.

Rules to avoid blank renders:
- Ensure a deterministic height on a parent container when using responsive wrappers.
  - Example wrappers:
    - `className="h-64"` on a parent `<div>`
    - or inline style: `<div style={{ width: '100%', height: 256 }}>`.
- For Recharts:
  - Either use a fixed `width/height` on `<BarChart />` to validate rendering, or
  - Wrap `<ResponsiveContainer>` with a parent that has a fixed, non-zero height.
- For `@react-three/fiber` (R3F):
  - The `<Canvas />` must be inside a container with explicit height (e.g., `h-64`).

Troubleshooting blank charts:
- Symptom: no error, empty box.
- Root cause: the responsive container’s parent had height 0 during measurement.
- Fix: set a fixed height on a wrapper div.

---

## 6) HTML mode notes

- HTML is rendered in a sandboxed iframe (`sandbox="allow-scripts allow-forms"`).
- We now allow scripts and inline handlers in saved HTML (RBAC-protected path).
- Locale passthrough: the token `{{LOCALE}}` is replaced with the runtime locale before injecting as `srcDoc`.

---

## 7) Common errors and their meaning

- “Element type is invalid…”
  - Usually missing or incorrect import; confirm the lib is in Allowed libraries AND an explicit `import` is present.
- “X is not defined”
  - Referenced a variable not in scope; add it to Scope config JSON (for plain values) or import it.
- Blank chart/canvas
  - Container height is 0 at first render; add a fixed height wrapper.

---

## 8) Working examples

Basic interactive (no extra libs):
```tsx
export default function Demo() {
  const [n, setN] = React.useState(5)
  return (
    <div className="p-4 text-themeTextWhite space-y-3">
      <div className="text-xs text-themeTextGray">Locale: {locale}</div>
      <input type="range" min={1} max={10} value={n} onChange={(e) => setN(Number(e.target.value))} />
      <div>Value: {n}</div>
    </div>
  )
}
```

Recharts + framer-motion:
```tsx
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Q1", value: 1200 },
  { name: "Q2", value: 1900 },
  { name: "Q3", value: 900 },
  { name: "Q4", value: 1600 },
]

export default function Demo() {
  const [scale, setScale] = React.useState(1)
  const currency = typeof appCurrency === 'string' ? appCurrency : 'INR'

  return (
    <div className="p-4 md:p-6 text-themeTextWhite space-y-4">
      <div className="text-xs text-themeTextGray">Locale: {locale}</div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Animated Quarterly Bars</h3>
        <input type="range" min={0.8} max={1.4} step={0.05} value={scale} onChange={(e) => setScale(Number(e.target.value))} />
      </div>
      <motion.div className="bg-[#161a20] border border-themeGray/60 rounded p-4" initial={{ opacity: 0.4, scale: 0.98 }} animate={{ opacity: 1, scale }} transition={{ type: 'spring', stiffness: 120, damping: 16 }}>
        <div style={{ width: '100%', height: 256 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap={24}>
              <XAxis dataKey="name" stroke="#9aa3af" />
              <YAxis stroke="#9aa3af" />
              <Tooltip formatter={(v: any) => new Intl.NumberFormat(locale || 'en', { style: 'currency', currency }).format(v)} />
              <Bar dataKey="value" fill="#4F46E5" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
```

---

## 9) Performance and safety

- Only allowed libraries are dynamically imported for each demo (keeps bundles lean).
- Avoid long-running effects; prefer memoized computations.
- Do not assume access to app internals; the scope is explicit by design.

---

## 10) Requesting capabilities

If you need a new package:
1) Ask maintainers to add it to the allowlist in `onUpdateInteractiveRunner` and to the dynamic import mapping in `InteractiveView.tsx`.
2) Install it in the app.
3) Add it to your section’s Allowed libraries and import it in your code.

If you need a new global variable:
- Add it to your section’s Scope config JSON (simple values).
- For functions/objects, consult maintainers (exposed globals should be deliberate and safe).

---

## 11) HTML mode quick reference

- Paste HTML in the HTML tab; we allow scripts but render in a sandboxed iframe.
- Locale token: use `{{LOCALE}}` in HTML to inject current locale.
- Prefer React mode for modern interactivity.

---

## 12) Troubleshooting checklist

- Imports added at top for all external packages?
- Libraries listed in Allowed libraries?
- Container has a measurable height for responsive visuals?
- Scope config is valid JSON and variables spelled correctly?
- Check the preview error panel for syntax/runtime messages.
