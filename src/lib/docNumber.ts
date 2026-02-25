import documentsData from '../data/documents.json'
import type { Document } from '../components/documents/DocumentCard'

const allDocuments = documentsData.documents as Document[]

/**
 * Builds a Map<docId, "ROA-YYYY-XXXX"> at module load time.
 *
 * Algorithm (deterministic across builds):
 *   1. Group documents by year (null → "0000").
 *   2. Within each year group, sort by title ascending (locale-aware).
 *   3. Assign a 1-based, zero-padded 4-digit index: 0001, 0002, …
 *
 * The sequence is stable as long as the documents.json order or contents
 * do not change — document numbers are never random and never regenerated.
 */
const docNumberMap: Map<string, string> = (() => {
  const groups = new Map<string, Document[]>()

  for (const doc of allDocuments) {
    const yearKey = doc.year ?? '0000'
    let arr = groups.get(yearKey)
    if (arr === undefined) {
      arr = []
      groups.set(yearKey, arr)
    }
    arr.push(doc)
  }

  const result = new Map<string, string>()

  for (const [yearKey, docs] of groups) {
    const sorted = [...docs].sort((a, b) => {
      const ta = a.title.toLowerCase()
      const tb = b.title.toLowerCase()
      return ta < tb ? -1 : ta > tb ? 1 : 0
    })
    sorted.forEach((doc, idx) => {
      const seq = String(idx + 1).padStart(4, '0')
      result.set(doc.id, `ROA-${yearKey}-${seq}`)
    })
  }

  return result
})()

/**
 * Returns the immutable document number for a given document ID.
 * Falls back to "ROA-0000-0000" if the ID is not found (should not happen
 * in normal operation — all IDs come from the same documents.json).
 */
export function getDocNumber(docId: string): string {
  return docNumberMap.get(docId) ?? 'ROA-0000-0000'
}
