# UI Migration Guide: Separate Pages per Block Type

This document outlines the minimal, UI-relevant changes to support typed Section pages per block type, DB schema usage, and localization behavior.

## Summary

- **Separate pages per block type**: Each `Section` gets its own page. Non-text blocks render typed components from `Section.blockPayload`; rich text uses the Novel editor from `Section.jsonContent` with `htmlContent` and `content` available for previews.
- **DB contracts (read)**
  - `Course`: use `id`, `name`, `description`, `slug`.
  - `Module`: use `id`, `courseId`, `title`, `order`, `slug`, `subtitle?`, `difficulty?`, `estimatedMinutes?`, `learningObjectives?`.
  - `Section`: use `id`, `moduleId`, `name`, `order`, `type`, `anchorIds`, `blockPayload`, `jsonContent` (jsonb), `htmlContent?`, `content?`.
- **DB contracts (localized read)**
  - `CourseTranslation`: `name`, `description`, `learnOutcomes` (JSON array of `{ outcome, assessment_criteria[] }`), `faq?`.
  - `ModuleTranslation`: `title`, `subtitle?`, `learningObjectives?` (jsonb array/string array acceptable).
  - `SectionTranslation`: `contentJson` (JSON), `contentHtml?` (String), `contentText?` (String).
- **Write rules**
  - Concept: write Novel doc to `Section.jsonContent` (jsonb) and derived `htmlContent` (String) and `content` (String); do not touch `blockPayload`.
  - Typed: write structured payload to `Section.blockPayload`; leave `jsonContent` unset.
  - Localized writes use the corresponding `*Translation` tables, not the base tables. Note: current backend may skip `SectionTranslation` writes; UI must fallback to base `Section` fields when translations are absent.

---

## Routing

- **Module overview**: `/courses/:courseId/modules/:moduleId`
- **Section detail**: `/courses/:courseId/modules/:moduleId/sections/:sectionId`
  - Resolve `Section` by `sectionId`, then branch by `Section.type`.
  - Keep routes stable; do not depend on `type` in the URL (optional cosmetic segment is fine).

---

## Data Fetching

- **Module overview list**
  - Query minimal fields for each Section: `id, name, order, type`.
  - Badge by `type`; click to open section page.

- **Section detail**
  - Base fetch: `id, moduleId, name, order, type, anchorIds, blockPayload, jsonContent, htmlContent, content`.
  - If `locale=xx`:
    - Concept: overlay `SectionTranslation.contentJson` (Novel doc) over base. Optionally use `SectionTranslation.contentHtml`/`contentText` for read-only render.
    - Typed: read `SectionTranslation.contentJson.blockPayload` (fallback to base `blockPayload` if absent).

---

## Rendering Rules

- **Concept (Novel)**
  - Render Novel editor using `jsonContent` (or localized `SectionTranslation.contentJson`).
  - For list cards or SSR previews, prefer `htmlContent` and `content` when present (sanitize HTML on client).
- **Typed blocks**
  - Supported types: `concept | example | case_study | interactive | quiz | reflection | callout`.
  - Render block-specific React pages/components from `blockPayload` (or localized `contentJson.blockPayload`).

---

## Typed Payload Shapes (client expectations)

Use TypeScript `type` declarations that mirror `graphs/content_generation_from_plan/models.py` exactly.

```ts
// Common
export type SectionType = 'concept'|'example'|'case_study'|'interactive'|'quiz'|'reflection'|'callout'

export type BaseSection = {
  id: string
  moduleId: string
  name: string
  order: number
  type: SectionType
  anchorIds: string[]
}

// Novel blocks (concept): UI uses Novel JSON stored in Section.jsonContent
export type ConceptSection = BaseSection & { jsonContent: any }

// Pydantic-aligned payload shapes for typed blocks
export type QAPair = {
  question: string
  answer: string
}

export type ConceptBlockPayload = {
  heading: string
  rich_text_md: string
  image_key?: string | null
  key_terms: string[]
  sebi_context: string
}

export type ExampleBlockPayload = {
  scenario_title: string
  scenario_md: string
  qa_pairs: QAPair[]
  indian_context: boolean
}

export type CaseStudyBlockPayload = {
  title: string
  background_md: string
  data_points: string[]
  timeline_steps: string[]
  analysis_md: string
  decision_md: string
  outcome_md: string
  learning_points: string[]
  sebi_context: string
}

export type WidgetConfig = {
  title: string
  description: string
  parameters: string[]
  default_values: string[]
}

export type ScoringRubric = {
  criteria: string[]
  scoring_method: string
  passing_threshold: string
}

export type InteractiveBlockPayload = {
  widget_kind: string
  widget_config: WidgetConfig
  instructions_md: string
  expected_outcomes: string[]
  scoring_rubric: ScoringRubric
  fallback_content: string
}

export type QuizChoice = {
  text: string
  correct: boolean
  explanation: string
}

export type QuizItem = {
  stem: string
  choices: QuizChoice[]
  rationale: string
  anchor_ids: string[]
  difficulty: string
}

export type QuizBlockPayload = {
  quiz_type: string
  items: QuizItem[]
  pass_threshold: number
}

export type ReflectionBlockPayload = {
  prompt_md: string
  guidance_md: string
  min_chars: number
  reflection_type: string
  sample_responses: string[]
}

export type CalloutBlockPayload = {
  style: string
  title: string
  text_md: string
  icon: string
  dismissible: boolean
}

export type TypedSection<T> = BaseSection & { blockPayload: T }
```

---

## Block Payload Field Reference and UI Usage

The following maps `graphs/content_generation_from_plan/models.py` payload fields to concrete UI behaviors for each block page.

### Concept

- **block_title**: Title shown at the top of the page and used as `Section.name` default.
- **rich_text_md**: Source markdown. Backend converts to TipTap and saves in `Section.jsonContent` (editor doc), with `htmlContent`/`content` for previews. UI should bind Novel editor to `jsonContent` and ignore `blockPayload.rich_text_md`.
- **image_key?**: Optional visual. If present, render above or in-line near the first section. Use your media resolver to map key → URL.
- **key_terms[]**: Render as chips or glossary links; consider a side panel “Key Terms”. Link to glossary pages if available.
- **sebi_context**: Render as a compliance callout or info banner near the end of the article.

### Example

- **block_title**: Header/title of the example page.
- **scenario_md**: Render as markdown (or convert to TipTap for display-only). Keep numeric figures styled (monospace) for quick scanning.
- **qa_pairs[] (question, answer)**: Accordion list or split Q/A layout. Allow expand/collapse per pair. Consider copy-to-clipboard for answers.
- **indian_context (bool)**: Show a badge (e.g., “India context”) when true.

### Case Study

- **block_title**: Page title and section header.
- **background_md**: Render as markdown. Use a contextual intro block.
- **data_points[]**: Present as a definition list or compact cards (Key/Value facts).
- **timeline_steps[]**: Vertical timeline component with dates/periods if parsed from text.
- **analysis_md**: Markdown body; consider a subheading “Analysis”.
- **decision_md**: Highlight decision with a success/info callout.
- **outcome_md**: Outcome summary; consider an "After" card.
- **learning_points[]**: Bulleted checklist with check icons; optionally copyable.
- **sebi_context**: Compliance callout box with link(s) to anchor references if available.

### Interactive

- **block_title**: Title of the activity.
- **widget_kind**: Switch which widget to render (calculator | simulation | decision_tree | drag_drop | scenario_builder).
- **widget_config { title, description, parameters[], default_values[] }**: Configure widget UI. Map `parameters` to input controls and prefill from `default_values` when matched by index or name.
- **instructions_md**: Collapsible instructions panel shown by default on first load.
- **expected_outcomes[]**: Bulleted list under an “Expected Outcomes” section; show completion criteria if relevant.
- **scoring_rubric { criteria[], scoring_method, passing_threshold }**: Display rubric below the widget or on a Results tab; use `passing_threshold` to compute pass/fail labels.
- **fallback_content**: Text/markdown to show if widget cannot load; present an inline alert with this content.

### Quiz

- **block_title**: Title/header of the quiz page.
- **items[]**: Render as sequential questions with navigation or one-per-page.
  - **stem**: Question text (supports minimal markdown).
  - **choices[] (text, correct, explanation)**: Multiple-choice options. After selection or submission, show explanation; style correct/incorrect choices.
  - **rationale**: Show beneath choices as an expandable “Why” section.
  - **anchor_ids[]**: Render SEBI references as links/tooltips (resolve IDs to Anchor entities; display title/excerpt on hover).
  - **difficulty**: Badge (easy/medium/hard). Optionally filter or adapt pass thresholds.

### Reflection

- **block_title**: Title/header of the reflection task.
- **prompt_md**: Markdown prompt; display prominently with typographic emphasis.
- **guidance_md**: Collapsible guidance/hints area.
- **min_chars**: Validate input length and show a character counter.
- **reflection_type**: Determine UI (free_text vs guided form). For simple MVP, free text area.
- **sample_responses[]**: Show as expandable examples/hints, not selectable answers.

### Callout

- **style**: Visual style (info | success | warning | danger, etc.). Map to component variant.
- **block_title (title)**: Callout title.
- **text_md**: Markdown content inside the callout.
- **icon**: Optional leading icon; map to your icon set.
- **dismissible**: If true, allow temporary dismissal (persist per user if needed).

### Anchor usage in UI

- **Section.anchorIds (String[])**: Display context anchors relevant to the section (e.g., sidebar “References” with titles/excerpts). IDs are string UUIDs.
- **QuizItem.anchor_ids**: Show inline reference chips per question. Clicking should open a reference modal or tooltip.

---

## Localization Behavior

- **Base EN**
  - Stored in base tables: `Course`, `Module`, `Section`.
- **Other locales**
  - `CourseTranslation`: `name`, `description`, `faq?`, `learnOutcomes` (JSON array of LearningOutcome objects). Base `Course` contains non-localized meta: `target_audience?`, `status?`, `prerequisites[]`, `tags[]`, `estimatedMinutes?`.
  - `ModuleTranslation`: `title`, `subtitle?`, `learningObjectives?` (jsonb).
  - `SectionTranslation`:
    - Concept: `contentJson` holds Novel doc; `contentHtml`/`contentText` optional for read-only use.
    - Typed: `contentJson = { blockPayload: <payload> }`.
- **UI overlay**
  - Concept: prefer `SectionTranslation.contentJson` when present; fallback to `Section.jsonContent`.
  - Typed: prefer `SectionTranslation.contentJson.blockPayload`; fallback to `Section.blockPayload`.

---

## Write Semantics

- **Concept**
  - Save Novel doc → `Section.jsonContent` (EN) or `SectionTranslation.contentJson` (locale).
  - Also persist `htmlContent` and `content` (and `SectionTranslation.contentHtml`/`contentText` for locales when supported).
- **Typed**
  - Save payload → `Section.blockPayload` (EN) or `SectionTranslation.contentJson = { blockPayload: ... }` (locale).
- **Do not** write typed payloads into `jsonContent`.

---

## Minimal Queries (examples)

```sql
-- Sections of a module (ordered)
SELECT "id","name","order","type"
FROM "Section"
WHERE "moduleId" = $1
ORDER BY "order" ASC;

-- Determine presence of quizzes/interactive (derived)
SELECT COUNT(*) FROM "Section" WHERE "moduleId" = $1 AND "type" = 'quiz';
SELECT COUNT(*) FROM "Section" WHERE "moduleId" = $1 AND "type" = 'interactive';

-- Localized section content (prefer JSON, optional HTML/text for read-only)
SELECT "contentJson","contentHtml","contentText"
FROM "SectionTranslation"
WHERE "sectionId" = $1 AND "locale" = $2;
```

---

## Module Overview UI

- Show sections list with `name`, `order`, `type` badges.
- Provide reordering by updating `Section.order`.
- Provide “Add Section” → choose `type`, create section with a minimal default `name` and skeleton `blockPayload` for typed.

---

## Section Detail UI

- Load section by `sectionId`.
- Branch by `type`:
  - `concept` → Novel editor bound to `jsonContent` (use `htmlContent`/`content` for previews where editing is not needed).
  - Others → typed page bound to `blockPayload` shape.
- For locales, overlay from `SectionTranslation.contentJson` (with `contentHtml`/`contentText` for read-only fallback when available).

---

## Backward Compatibility & Migration

- Legacy behavior likely stored generated payloads in `jsonContent`. New rule splits:
  - Keep rich text in `jsonContent` (Novel only). Note: column is now jsonb.
  - Move typed payloads to `blockPayload`.
- Optional migration script: copy legacy typed payloads from `jsonContent` → `blockPayload` when `type` ≠ 'concept'.

---

## TipTap Conversion Pipeline (backend)

- **Source**: Concept block `payload.rich_text_md` (Markdown).
- **Converter**: Bun script `markdown-converter/src/convertMarkdown.ts` produces `{ json, html, text }`.
- **Persistence**:
  - `Section.jsonContent` ← TipTap `json` (jsonb)
  - `Section.htmlContent` ← `html`
  - `Section.content` ← `text`
- **UI usage**:
  - Use `jsonContent` with Novel editor for editing.
  - Use `htmlContent`/`content` for fast read-only previews or SEO rendering.

---

## Checklist

- **Routing**: add section detail route and navigation from module overview.
- **Fetch**: implement minimal list and detail queries.
- **Render**: concept → Novel; typed → dedicated components using `blockPayload`.
- **i18n overlay**: use `*Translation` tables as described; implement fallback to EN.
- **Saves**: write to base vs translation tables based on active locale.
- **QA**: verify typed payload shapes per component and localized overlay behavior.
