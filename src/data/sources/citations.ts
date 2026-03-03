import { type DocRecord, type FaqEntry, type Citation, type SourceSet } from './types.ts'

// ── Prompt builder ─────────────────────────────────────────────────────────────

export function buildSourcePrompt(question: string, { docs, faqs }: SourceSet): string {
  const lines: string[] = []

  for (const doc of docs) {
    lines.push(
      `[D:${doc.id}] "${doc.title}" — year: ${doc.year}, category: ${doc.category}, ` +
      `url: /documents/${doc.id}`
    )
  }

  for (const faq of faqs) {
    const deep = faq.deepAnswer.slice(0, 2).map(d => `  — ${d}`).join('\n')
    lines.push(
      `[F:${faq.id}] "${faq.question}"\n` +
      `  Summary: ${faq.shortAnswer}\n` +
      (deep ? `${deep}\n` : '') +
      `  Constitutional continuity argument: ${faq.ambazoniaClaim}\n` +
      `  Cameroon position: ${faq.cameroonPosition}\n` +
      `  International context: ${faq.internationalContext}`
    )
  }

  return (
    `Question: ${question}\n\n` +
    `Available sources (use ONLY these):\n${lines.join('\n\n')}\n\n` +
    `Answer the question using only these sources. Cite every major paragraph with [D:id] or [F:id].`
  )
}

// ── Citation extraction from LLM answer ───────────────────────────────────────

export function extractCitationsFromAnswer(
  answer: string,
  { docs, faqs }: SourceSet,
): Citation[] {
  const docMap = new Map(docs.map(d => [d.id, d]))
  const faqMap = new Map(faqs.map(e => [e.id, e]))
  const seen   = new Set<string>()
  const result: Citation[] = []

  const re = /\[([DF]):([^\]]{1,120})\]/g
  let match: RegExpExecArray | null

  while ((match = re.exec(answer)) !== null && result.length < 8) {
    const kind = match[1]!
    const id   = match[2]!
    const key  = `${kind}:${id}`
    if (seen.has(key)) continue
    seen.add(key)

    if (kind === 'D') {
      const doc = docMap.get(id)
      if (doc) result.push(docToCitation(doc))
    } else {
      const faq = faqMap.get(id)
      if (faq) result.push(faqToCitation(faq))
    }
  }

  return result
}

// ── Deterministic citation list builder ───────────────────────────────────────

export function buildDeterministicCitations({ docs, faqs }: SourceSet): Citation[] {
  const result: Citation[] = []
  for (const doc of docs.slice(0, 4)) result.push(docToCitation(doc))
  for (const faq of faqs.slice(0, 2)) result.push(faqToCitation(faq))
  return result.slice(0, 8)
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function docToCitation(doc: DocRecord): Citation {
  return {
    type:  'document',
    id:    doc.id,
    title: doc.title,
    url:   `/documents/${doc.id}`,
    quote: doc.title.slice(0, 240),
    why:   `${doc.category} document (${doc.year})`,
  }
}

function faqToCitation(faq: FaqEntry): Citation {
  return {
    type:  'faq',
    id:    faq.id,
    title: faq.question,
    url:   `/research/orientation#faq-${faq.id}`,
    quote: faq.shortAnswer.slice(0, 240),
    why:   'Orientation FAQ entry',
  }
}
