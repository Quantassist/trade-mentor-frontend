export type SectionType = 'concept'|'example'|'case_study'|'interactive'|'quiz'|'reflection'|'callout'

export type BaseSection = {
  id: string
  moduleId: string
  name: string
  order: number
  type: SectionType
  anchorIds: string[]
}

export type ConceptSection = BaseSection & { jsonContent: any }

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
