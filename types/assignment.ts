export type FileCategory = "assignment-brief" | "module-material" | "reading-list" | "other"

export type FileInfo = {
  id: string
  name: string
  size: string
  type: string
  progress: number
  status: "uploading" | "complete" | "error"
  content?: string
  category: FileCategory
}

export type AssignmentSection = {
  id: string
  title: string
  content: string
  wordCount: number
}

export type AssignmentDetails = {
  id: string
  title: string
  wordCount: number
  pageCount: number
  format: string
  references: number
  referenceStyle: string
  sections: AssignmentSection[]
  createdAt: Date
}

export type GenerationSettings = {
  academicStyle: boolean
  includeCitations: boolean
  includeExamples: boolean
  addConclusion: boolean
  wordCount: number
  referenceStyle: string
  additionalInstructions: string
  copies: number
}

export type RegenerationOptions = {
  changeStyle: boolean
  adjustWordCount: boolean
  addReferences: boolean
  changeFocus: boolean
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isLoading?: boolean
}

export const REFERENCE_STYLES = ["APA", "Harvard", "MLA", "Chicago", "Vancouver", "IEEE", "Oxford", "AMA"]
