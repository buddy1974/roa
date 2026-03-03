import { type DocRecord, type FaqEntry } from './types.ts'

// ── Constants ─────────────────────────────────────────────────────────────────

export const DETERMINISTIC_THRESHOLD = 8

export const KEY_TERMS: ReadonlySet<string> = new Set([
  '1961', 'plebiscite', 'trusteeship', 'scnc', 'independence', 'federation',
  'anglophone', 'foumban', 'gorji', 'dinka', 'ambazonia', 'cameroon',
  'secession', 'referendum', 'mandate', 'decolonisation', 'sovereignty',
])

const CATEGORY_TERMS: ReadonlySet<string> = new Set([
  'historical', 'legal', 'un', 'diplomatic', 'constitutional',
])

// ── Tokenizer ─────────────────────────────────────────────────────────────────

export function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length >= 3)
}

// ── Scoring ───────────────────────────────────────────────────────────────────

export function scoreDoc(
  doc:    DocRecord,
  q:      string,
  words:  string[],
  qYears: string[],
): number {
  const tl = doc.title.toLowerCase()
  let s = 0

  if (tl.includes(q)) s += 8

  let wordHits = 0
  for (const w of words) { if (tl.includes(w)) wordHits++ }
  s += Math.min(wordHits, 10)

  if (qYears.some(y => doc.year === y)) s += 2

  for (const cat of CATEGORY_TERMS) {
    if (q.includes(cat) && doc.category.toLowerCase().includes(cat)) { s += 2; break }
  }

  let keyHits = 0
  for (const term of KEY_TERMS) {
    if (q.includes(term) && tl.includes(term)) keyHits++
  }
  s += Math.min(keyHits, 6)

  return s
}

export function scoreFaq(
  entry: FaqEntry,
  q:     string,
  words: string[],
): number {
  const ql = entry.question.toLowerCase()
  const sl = entry.shortAnswer.toLowerCase()
  let s = 0

  if (ql.includes(q)) s += 8

  let qHits = 0
  for (const w of words) { if (ql.includes(w)) qHits++ }
  s += Math.min(qHits, 10)

  let sHits = 0
  for (const w of words) { if (sl.includes(w)) sHits++ }
  s += Math.min(sHits, 6)

  for (const term of KEY_TERMS) {
    if (q.includes(term) && (ql.includes(term) || sl.includes(term))) s += 3
  }

  return s
}
