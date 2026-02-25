import type { IncomingMessage, ServerResponse } from 'node:http'
import documentsData from '../src/data/documents.json'
import faqData from '../src/data/orientation_faq.json'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DocRecord {
  id:       string
  title:    string
  year:     string
  category: string
}

interface FaqEntry {
  id:                   string
  question:             string
  shortAnswer:          string
  deepAnswer:           string[]
  ambazoniaClaim:       string
  cameroonPosition:     string
  internationalContext: string
  relatedDocuments:     string[]
}

interface Citation {
  type:  'document' | 'faq'
  id:    string
  title: string
  url:   string
  quote: string
  why:   string
}

interface ChatRequest {
  question:    string
  mode:        'deterministic' | 'ai'
  maxSources?: number
}

interface ChatResponse {
  mode:     string
  answer:   string
  citations: Citation[]
  limits:   { usedSources: number }
}

interface RateBucket { count: number; resetAt: number }

// ── Module-level data ──────────────────────────────────────────────────────────

const ALL_DOCS: DocRecord[] = (documentsData as { documents: DocRecord[] }).documents
const ALL_FAQ:  FaqEntry[]  = (faqData as { entries: FaqEntry[] }).entries

// ── Rate limiting ──────────────────────────────────────────────────────────────

const rateBuckets = new Map<string, RateBucket>()
const RATE_MAX       = 20
const RATE_WINDOW_MS = 10 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now    = Date.now()
  const bucket = rateBuckets.get(ip)
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (bucket.count >= RATE_MAX) return false
  bucket.count++
  return true
}

// ── Retrieval scoring ─────────────────────────────────────────────────────────

const KEY_TERMS = new Set([
  '1961', 'plebiscite', 'trusteeship', 'scnc', 'independence', 'federation',
  'anglophone', 'foumban', 'gorji', 'dinka', 'ambazonia', 'cameroon',
  'secession', 'referendum', 'mandate', 'decolonisation', 'sovereignty',
])

const YEAR_RE       = /\b(19|20)\d{2}\b/g
const CATEGORY_TERMS = new Set(['historical', 'legal', 'un', 'diplomatic', 'constitutional'])

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length >= 3)
}

function scoreDoc(doc: DocRecord, q: string, words: string[], qYears: string[]): number {
  const tl = doc.title.toLowerCase()
  let s = 0

  // Exact phrase match in title: +8
  if (tl.includes(q)) s += 8

  // Word overlap in title: +1 per token (cap 10)
  let wordHits = 0
  for (const w of words) { if (tl.includes(w)) wordHits++ }
  s += Math.min(wordHits, 10)

  // Year match: +2
  if (qYears.some(y => doc.year === y)) s += 2

  // Category match: +2
  for (const cat of CATEGORY_TERMS) {
    if (q.includes(cat) && doc.category.toLowerCase().includes(cat)) { s += 2; break }
  }

  // Key-term word overlap (keywords proxy): +1 per term (cap 6)
  let keyHits = 0
  for (const term of KEY_TERMS) {
    if (q.includes(term) && tl.includes(term)) keyHits++
  }
  s += Math.min(keyHits, 6)

  return s
}

function scoreFaq(entry: FaqEntry, q: string, words: string[]): number {
  const ql = entry.question.toLowerCase()
  const sl = entry.shortAnswer.toLowerCase()
  let s = 0

  // Exact phrase in question: +8
  if (ql.includes(q)) s += 8

  // Word overlap in question: +1 per token (cap 10)
  let qHits = 0
  for (const w of words) { if (ql.includes(w)) qHits++ }
  s += Math.min(qHits, 10)

  // Word overlap in shortAnswer (keyword proxy): +1 per token (cap 6)
  let sHits = 0
  for (const w of words) { if (sl.includes(w)) sHits++ }
  s += Math.min(sHits, 6)

  // Key-term bonus: +3 per matching term
  for (const term of KEY_TERMS) {
    if (q.includes(term) && (ql.includes(term) || sl.includes(term))) s += 3
  }

  return s
}

function retrieveSources(
  question: string,
  maxN: number,
): { docs: DocRecord[]; faqs: FaqEntry[] } {
  const q     = question.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
  const words = tokenize(q)
  const qYears: string[] = Array.from(q.matchAll(YEAR_RE), m => m[0])

  const scoredDocs = ALL_DOCS
    .map(d => ({ doc: d, score: scoreDoc(d, q, words, qYears) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  const scoredFaqs = ALL_FAQ
    .map(e => ({ entry: e, score: scoreFaq(e, q, words) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  const docs: DocRecord[] = []
  const faqs: FaqEntry[]  = []

  // Guarantee at least 2 docs and 1 FAQ if available
  const minDocs = Math.min(2, scoredDocs.length)
  for (let i = 0; i < minDocs; i++) docs.push(scoredDocs[i].doc)
  if (scoredFaqs.length > 0) faqs.push(scoredFaqs[0].entry)

  // Fill remaining slots
  let remaining = maxN - docs.length - faqs.length
  for (let i = minDocs; i < scoredDocs.length && remaining > 0; i++) {
    docs.push(scoredDocs[i].doc)
    remaining--
  }
  for (let i = 1; i < scoredFaqs.length && remaining > 0; i++) {
    faqs.push(scoredFaqs[i].entry)
    remaining--
  }

  return { docs, faqs }
}

// ── Refusal policy ────────────────────────────────────────────────────────────

const REFUSE_PATTERNS: RegExp[] = [
  /\b(how to|instructions? for|steps? to)\b.{0,40}\b(kill|bomb|attack|assassinat|weapon|explosive|genocide|poison)\b/i,
  /\bextremist (propaganda|recruit|manifesto)\b/i,
  /\bterror(ist)? (manual|guide|tutorial|training)\b/i,
]

function isRefused(question: string): boolean {
  return REFUSE_PATTERNS.some(re => re.test(question))
}

// ── LLM system prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an institutional explainer for the Republic of Ambazonia Archive, a neutral historical and legal document repository.
Your sole task is to answer the user's question using ONLY the sources provided.
Rules:
- Every major paragraph must end with bracketed citations: [D:documentId] for documents, [F:faqId] for FAQ entries.
- If a claim cannot be supported by the provided sources, write exactly: "Not established in available sources."
- Maintain a calm, scholarly tone. No advocacy, no calls to action, no militant language, no glorification of any party.
- When the topic involves disputed history or legal status, clearly present three perspectives in sequence:
  (1) Ambazonian claim  (2) Cameroon position  (3) International context
- Do not fabricate URLs, quotes, or citations not derived from the sources listed.
- Keep the response under 1100 words.`

// ── User prompt builder ───────────────────────────────────────────────────────

function buildPrompt(question: string, docs: DocRecord[], faqs: FaqEntry[]): string {
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
      `  Ambazonian claim: ${faq.ambazoniaClaim}\n` +
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

// ── Anthropic Messages API call ───────────────────────────────────────────────

async function callAnthropic(userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1800,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Anthropic ${response.status}: ${text.slice(0, 200)}`)
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>
  }
  return data.content.find(c => c.type === 'text')?.text ?? ''
}

// ── Citation extraction ───────────────────────────────────────────────────────

function extractCitations(
  answer:  string,
  docs:    DocRecord[],
  faqs:    FaqEntry[],
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
      if (doc) {
        result.push({
          type:  'document',
          id:    doc.id,
          title: doc.title,
          url:   `/documents/${doc.id}`,
          quote: doc.title.slice(0, 240),
          why:   `${doc.category} document (${doc.year})`,
        })
      }
    } else {
      const faq = faqMap.get(id)
      if (faq) {
        result.push({
          type:  'faq',
          id:    faq.id,
          title: faq.question,
          url:   `/research/orientation#faq-${faq.id}`,
          quote: faq.shortAnswer.slice(0, 240),
          why:   'Orientation FAQ entry',
        })
      }
    }
  }

  return result
}

// ── Deterministic mode response ───────────────────────────────────────────────

function buildDeterministicResponse(
  question: string,
  docs:     DocRecord[],
  faqs:     FaqEntry[],
): ChatResponse {
  const citations: Citation[] = []

  for (const doc of docs.slice(0, 4)) {
    citations.push({
      type:  'document',
      id:    doc.id,
      title: doc.title,
      url:   `/documents/${doc.id}`,
      quote: doc.title.slice(0, 240),
      why:   `${doc.category} document (${doc.year})`,
    })
  }
  for (const faq of faqs.slice(0, 2)) {
    citations.push({
      type:  'faq',
      id:    faq.id,
      title: faq.question,
      url:   `/research/orientation#faq-${faq.id}`,
      quote: faq.shortAnswer.slice(0, 240),
      why:   'Orientation FAQ entry',
    })
  }

  const answer = citations.length > 0
    ? `Archive sources retrieved for: "${question}". Review the cited entries for detailed information.`
    : `Insufficient archive support for the query "${question}". Consider browsing the document archive or orientation FAQ.`

  return {
    mode:      'deterministic',
    answer,
    citations: citations.slice(0, 8),
    limits:    { usedSources: citations.length },
  }
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function json(res: ServerResponse, status: number, data: unknown): void {
  const payload = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type':                 'application/json',
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(payload)
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end()
    return
  }

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' })
    return
  }

  // Rate limit
  const rawIp = req.headers['x-forwarded-for']
  const ip    = (typeof rawIp === 'string' ? rawIp.split(',')[0]?.trim() : undefined) ?? 'unknown'
  if (!checkRateLimit(ip)) {
    json(res, 429, { error: 'Rate limit exceeded. Please wait before retrying.', code: 'RATE_LIMITED' })
    return
  }

  // Parse body
  let rawBody: string
  try { rawBody = await readBody(req) }
  catch { json(res, 400, { error: 'Failed to read request body' }); return }

  let parsed: unknown
  try { parsed = JSON.parse(rawBody) }
  catch { json(res, 400, { error: 'Invalid JSON' }); return }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    json(res, 400, { error: 'Request body must be a JSON object' })
    return
  }

  const body = parsed as Partial<ChatRequest>

  // Validate question
  if (typeof body.question !== 'string' || body.question.trim() === '') {
    json(res, 400, { error: 'question must be a non-empty string' })
    return
  }
  const question = body.question.slice(0, 500).trim()

  // Validate mode
  const mode = body.mode ?? 'deterministic'
  if (mode !== 'deterministic' && mode !== 'ai') {
    json(res, 400, { error: 'mode must be "deterministic" or "ai"' })
    return
  }

  // Validate maxSources
  const maxSources = typeof body.maxSources === 'number'
    ? Math.min(Math.max(1, Math.floor(body.maxSources)), 8)
    : 6

  // Refusal
  if (isRefused(question)) {
    json(res, 200, {
      mode,
      answer:    'This question falls outside the scope of this archive. Please ask about the historical, legal, or political dimensions of the Ambazonia situation.',
      citations: [],
      limits:    { usedSources: 0 },
    })
    return
  }

  // Retrieval (always deterministic)
  const { docs, faqs } = retrieveSources(question, maxSources)

  if (mode === 'deterministic') {
    json(res, 200, buildDeterministicResponse(question, docs, faqs))
    return
  }

  // AI mode — requires LLM_API_KEY
  const apiKey = process.env['LLM_API_KEY']
  if (!apiKey) {
    json(res, 503, {
      error: 'AI mode is not configured on this deployment. LLM_API_KEY is not set.',
      code:  'LLM_NOT_CONFIGURED',
    })
    return
  }

  if (docs.length + faqs.length === 0) {
    json(res, 200, {
      mode:      'ai',
      answer:    `Insufficient archive support for the query "${question}". No relevant sources were retrieved. Browse /documents/archive or /research/orientation for related material.`,
      citations: [],
      limits:    { usedSources: 0 },
    })
    return
  }

  try {
    const prompt    = buildPrompt(question, docs, faqs)
    const answer    = await callAnthropic(prompt, apiKey)
    const citations = extractCitations(answer, docs, faqs)
    json(res, 200, {
      mode:      'ai',
      answer,
      citations,
      limits:    { usedSources: docs.length + faqs.length },
    })
  } catch (err) {
    const msg  = err instanceof Error ? err.message : 'Unknown error'
    const safe = msg.replace(/sk-[A-Za-z0-9_-]+/g, '[REDACTED]')
    json(res, 502, { error: `LLM call failed: ${safe}`, code: 'LLM_ERROR' })
  }
}
