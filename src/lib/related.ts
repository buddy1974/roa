import documentsData from '../data/documents.json'
import type { Document } from '../components/documents/DocumentCard'

const ALL_DOCS = documentsData.documents as Document[]

function scoreRelated(source: Document, candidate: Document): number {
  let score = 0

  // Same category
  if (source.category === candidate.category) score += 5

  // Shared relatedSections keywords
  for (const kw of source.relatedSections) {
    if (candidate.relatedSections.includes(kw)) score += 3
  }

  // Same non-null year
  if (source.year && candidate.year && source.year === candidate.year) score += 2

  // Title word overlap (words longer than 3 chars)
  const sourceWords = source.title.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const candidateTitle = candidate.title.toLowerCase()
  for (const w of sourceWords) {
    if (candidateTitle.includes(w)) score += 1
  }

  return score
}

/**
 * Returns up to `limit` documents most related to `docId`.
 *
 * Order is fully deterministic:
 *   primary   — score descending
 *   tiebreak  — document id ascending (plain string compare, no locale engine)
 *
 * Only documents with score > 0 are returned.
 */
export function getRelatedDocuments(docId: string, limit = 3): Document[] {
  const source = ALL_DOCS.find(d => d.id === docId)
  if (!source) return []

  return ALL_DOCS
    .filter(d => d.id !== docId)
    .map(d => ({ doc: d, score: scoreRelated(source, d) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.doc.id < b.doc.id ? -1 : a.doc.id > b.doc.id ? 1 : 0
    })
    .slice(0, limit)
    .map(({ doc }) => doc)
}
