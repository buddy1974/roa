// ── Shared types for docs, FAQs, citations, and retrieval results ──────────────

export interface DocRecord {
  id:       string
  title:    string
  year:     string
  category: string
}

export interface FaqEntry {
  id:                   string
  question:             string
  shortAnswer:          string
  deepAnswer:           string[]
  ambazoniaClaim:       string
  cameroonPosition:     string
  internationalContext: string
  relatedDocuments:     string[]
}

export interface Citation {
  type:  'document' | 'faq'
  id:    string
  title: string
  url:   string
  quote: string
  why:   string
}

export interface SourceSet {
  docs: DocRecord[]
  faqs: FaqEntry[]
}

export interface DeterministicResult {
  entry:     FaqEntry | null
  score:     number
  fallbacks: FaqEntry[]
}
