import { type DocRecord, type FaqEntry, type SourceSet, type DeterministicResult } from './types.ts'
import { DETERMINISTIC_THRESHOLD, KEY_TERMS, tokenize, scoreDoc, scoreFaq } from './scoring.ts'

// ── Retrieval — minimum 2 docs + 1 FAQ if available ───────────────────────────

export function retrieveFromData(
  allDocs:  DocRecord[],
  allFaqs:  FaqEntry[],
  question: string,
  maxN:     number,
): SourceSet {
  const q     = question.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
  const words = tokenize(q)
  const qYears: string[] = Array.from(q.matchAll(/\b(19|20)\d{2}\b/g), m => m[0])

  const scoredDocs = allDocs
    .map(d => ({ doc: d, score: scoreDoc(d, q, words, qYears) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  const scoredFaqs = allFaqs
    .map(e => ({ entry: e, score: scoreFaq(e, q, words) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  const docs: DocRecord[] = []
  const faqs: FaqEntry[]  = []

  // Guarantee at least 2 docs and 1 FAQ if available
  const minDocs = Math.min(2, scoredDocs.length)
  for (let i = 0; i < minDocs; i++) docs.push(scoredDocs[i]!.doc)
  if (scoredFaqs.length > 0) faqs.push(scoredFaqs[0]!.entry)

  // Fill remaining slots up to maxN
  let remaining = maxN - docs.length - faqs.length
  for (let i = minDocs; i < scoredDocs.length && remaining > 0; i++) {
    docs.push(scoredDocs[i]!.doc)
    remaining--
  }
  for (let i = 1; i < scoredFaqs.length && remaining > 0; i++) {
    faqs.push(scoredFaqs[i]!.entry)
    remaining--
  }

  return { docs, faqs }
}

// ── Deterministic chat matching (used by client-side Chat.tsx) ─────────────────

export function computeDeterministicMatch(
  entries:  FaqEntry[],
  rawQuery: string,
): DeterministicResult {
  if (entries.length === 0) return { entry: null, score: 0, fallbacks: [] }

  const q     = rawQuery.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
  const words = q.split(' ').filter(w => w.length >= 3)

  if (words.length === 0) {
    return { entry: null, score: 0, fallbacks: entries.slice(0, 3) }
  }

  const scored = entries.map(e => {
    let s = 0
    const ql  = e.question.toLowerCase()
    const sl  = e.shortAnswer.toLowerCase()
    const dl  = e.deepAnswer.join(' ').toLowerCase()
    const all = ql + ' ' + sl + ' ' + dl

    if (ql.includes(q)) s += 8

    const maxLen = Math.min(4, words.length)
    for (let len = maxLen; len >= 2; len--) {
      for (let i = 0; i <= words.length - len; i++) {
        const chunk = words.slice(i, i + len).join(' ')
        if (ql.includes(chunk))      s += 4
        else if (sl.includes(chunk)) s += 2
      }
    }

    for (const w of words) {
      if (ql.includes(w))  s += 2
      if (sl.includes(w) || dl.includes(w)) s += 1
    }

    for (const term of KEY_TERMS) {
      if (q.includes(term) && all.includes(term)) s += 3
    }

    return { entry: e, score: s }
  })

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]!

  if (best.score < DETERMINISTIC_THRESHOLD) {
    return { entry: null, score: best.score, fallbacks: scored.slice(0, 3).map(x => x.entry) }
  }

  return { entry: best.entry, score: best.score, fallbacks: [] }
}
