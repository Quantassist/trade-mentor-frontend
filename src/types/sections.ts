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

export type Persona = {
  name: string
  age: number
  occupation?: string
  financial_goal?: string
}

export type FinancialContext = {
  time_horizon?: string
  risk_tolerance?: string
  available_amount?: string
  current_situation?: string
}

export type ExampleBlockPayload = {
  block_title?: string | null
  scenario_md?: string | null
  persona: Persona[]
  qa_pairs: QAPair[]
  financial_context?: FinancialContext
  image_prompts?: string[]
}

export type TimelineStep = { date_period: string; event_description: string }

export type BranchingOption = {
  option_text: string
  is_correct?: boolean
  option_consequence?: string
}

export type BranchingNode = {
  node_id: string
  decision_prompt: string
  options: BranchingOption[]
}

export type CaseStudyBlockPayload = {
  block_title?: string | null
  background_md?: string | null
  analysis_md?: string | null
  decision_md?: string | null
  outcome_md?: string | null
  data_points: string[]
  timeline_steps: TimelineStep[]
  learning_points: string[]
  sebi_context?: string | null
  branching_points?: BranchingNode[]
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
