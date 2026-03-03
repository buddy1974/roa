import type { IncomingMessage, ServerResponse } from 'node:http'

// ── Constants ─────────────────────────────────────────────────────────────────

const DEST_EMAIL = 'RepublicOfAmbazoniaDao@gmail.com'
const FROM_EMAIL = 'ROA Archive <noreply@roa-archive.org>'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CitationRef {
  title: string
  url:   string
  why:   string
}

interface EscalateRequest {
  message:     string
  email?:      string
  citations?:  CitationRef[]
  pageContext?: string
  timestamp?:  string
}

// ── Refusal policy ────────────────────────────────────────────────────────────

const REFUSE_PATTERNS: RegExp[] = [
  /\b(how to|instructions? for|steps? to)\b.{0,40}\b(kill|bomb|attack|assassinat|weapon|explosive|genocide|poison)\b/i,
  /\bextremist (propaganda|recruit|manifesto)\b/i,
  /\bterror(ist)? (manual|guide|tutorial|training)\b/i,
]

function isRefused(message: string): boolean {
  return REFUSE_PATTERNS.some(re => re.test(message))
}

// ── Email body builder ────────────────────────────────────────────────────────

function buildEmailText(req: EscalateRequest): string {
  const lines: string[] = [
    '=== Human Review Request — ROA Archive ===',
    `Timestamp: ${req.timestamp ?? new Date().toISOString()}`,
    '',
    'Message:',
    req.message,
  ]
  if (req.email) {
    lines.push('', `Reply-to: ${req.email}`)
  }
  if (req.pageContext) {
    lines.push('', `Page context: ${req.pageContext}`)
  }
  if (req.citations && req.citations.length > 0) {
    lines.push('', 'Citations referenced:')
    for (const c of req.citations) {
      lines.push(`  — ${c.title} | ${c.url} | ${c.why}`)
    }
  }
  return lines.join('\n')
}

function buildMailto(req: EscalateRequest): string {
  const subject = encodeURIComponent('Human Review Request — ROA Archive')
  const body = encodeURIComponent(
    `Message: ${req.message.slice(0, 400)}` +
    (req.email ? `\n\nReply-to: ${req.email}` : '') +
    (req.pageContext ? `\n\nPage: ${req.pageContext}` : '')
  )
  return `mailto:${DEST_EMAIL}?subject=${subject}&body=${body}`
}

// ── Email delivery (Resend) ───────────────────────────────────────────────────
// EMAIL_PROVIDER_API_KEY must be a Resend API key (https://resend.com).
// The FROM_EMAIL sender domain must be verified in your Resend account.

async function sendEmail(text: string, apiKey: string): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from:    FROM_EMAIL,
      to:      [DEST_EMAIL],
      subject: 'Human Review Request — ROA Archive',
      text,
    }),
  })
  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Resend ${response.status}: ${err.slice(0, 200)}`)
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

  const body = parsed as Partial<EscalateRequest>

  // Validate message
  if (typeof body.message !== 'string' || body.message.trim() === '') {
    json(res, 400, { error: 'message must be a non-empty string' })
    return
  }
  const message = body.message.slice(0, 2000).trim()

  // Optional fields
  const email       = typeof body.email       === 'string' ? body.email.slice(0, 254).trim()       : undefined
  const pageContext = typeof body.pageContext  === 'string' ? body.pageContext.slice(0, 200)         : undefined
  const timestamp   = typeof body.timestamp   === 'string' ? body.timestamp.slice(0, 64)            : undefined
  const citations   = Array.isArray(body.citations)
    ? (body.citations as CitationRef[]).slice(0, 8)
    : undefined

  const escReq: EscalateRequest = { message, email, citations, pageContext, timestamp }

  // Refusal
  if (isRefused(message)) {
    json(res, 200, {
      ok:    false,
      error: 'This message cannot be forwarded. Please ensure your request is within the scope of the archive.',
    })
    return
  }

  // No API key → mailto fallback
  const apiKey = process.env['EMAIL_PROVIDER_API_KEY']
  if (!apiKey) {
    json(res, 200, { ok: false, fallback: 'mailto', mailto: buildMailto(escReq) })
    return
  }

  // Attempt delivery; fall back to mailto on failure
  try {
    await sendEmail(buildEmailText(escReq), apiKey)
    json(res, 200, { ok: true })
  } catch (err) {
    const msg  = err instanceof Error ? err.message : 'Unknown error'
    const safe = msg.replace(/re_[A-Za-z0-9_]+/g, '[REDACTED]')
    json(res, 200, {
      ok:      false,
      fallback: 'mailto',
      mailto:   buildMailto(escReq),
      error:    `Email delivery failed: ${safe}`,
    })
  }
}
