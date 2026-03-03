import type { IncomingMessage, ServerResponse } from 'node:http'
import documentsData from '../src/data/documents.json'
import faqData from '../src/data/orientation_faq.json'
import {
  retrieveFromData,
  buildSourcePrompt,
  extractCitationsFromAnswer,
  buildDeterministicCitations,
  type DocRecord,
  type FaqEntry,
  type Citation,
  type SourceSet,
} from '../src/data/sources/index.ts'

// ── Local types ────────────────────────────────────────────────────────────────

interface ChatRequest {
  question:    string
  mode:        'deterministic' | 'ai'
  maxSources?: number
}

interface ChatResponse {
  mode:      string
  answer:    string
  citations: Citation[]
  limits:    { usedSources: number }
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
- On first reference to the territory, use the formulation "Southern British Cameroons (today Republic of Ambazonia)".
- Frame the Ambazonia position as a constitutional continuity argument rooted in documented British trusteeship history and UN obligations, not as a separatist or militant position.
- When the topic involves disputed history or legal status, clearly present three perspectives in sequence:
  (1) Southern British Cameroons (today Republic of Ambazonia) constitutional continuity argument  (2) Cameroon position  (3) International context
- Do not fabricate URLs, quotes, or citations not derived from the sources listed.
- Keep the response under 1100 words.`

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

// ── Deterministic mode response ───────────────────────────────────────────────

function buildDeterministicResponse(question: string, sourceSet: SourceSet): ChatResponse {
  const citations = buildDeterministicCitations(sourceSet)
  const answer = citations.length > 0
    ? `Archive sources retrieved for: "${question}". Review the cited entries for detailed information.`
    : `Insufficient archive support for the query "${question}". Consider browsing the document archive or orientation FAQ.`

  return {
    mode:      'deterministic',
    answer,
    citations,
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

  // Retrieval (always runs)
  const sourceSet = retrieveFromData(ALL_DOCS, ALL_FAQ, question, maxSources)

  if (mode === 'deterministic') {
    json(res, 200, buildDeterministicResponse(question, sourceSet))
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

  const { docs, faqs } = sourceSet
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
    const prompt    = buildSourcePrompt(question, sourceSet)
    const answer    = await callAnthropic(prompt, apiKey)
    const citations = extractCitationsFromAnswer(answer, sourceSet)
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
