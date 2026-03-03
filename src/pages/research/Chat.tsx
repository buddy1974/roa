import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '../../components/layout/PageContainer'
import { RouteMeta } from '../../components/seo/RouteMeta'
import { copyToClipboard } from '../../lib/clipboard'
import { siteUrl } from '../../lib/env'
import documentsData from '../../data/documents.json'
import {
  computeDeterministicMatch,
  type DocRecord,
  type FaqEntry,
  type Citation,
} from '../../data/sources/index.ts'
import { JsonLd } from '../../components/seo/JsonLd'
import { webPageSchema } from '../../components/seo/schemas'

const CHAT_WEBPAGE_SCHEMA = webPageSchema(
  `${siteUrl}/research/chat`,
  'Research Chat — Republic of Ambazonia Archive',
  'Deterministic, document-grounded conversational orientation using the institutional archive.',
  siteUrl,
)

// orientation_faq.json is lazy-loaded — separate chunk, not in main bundle.

interface UserMsg {
  id:   string
  role: 'user'
  text: string
}

interface AsstMsg {
  id:        string
  role:      'assistant'
  query:     string
  entry:     FaqEntry | null
  fallbacks: FaqEntry[]
  score:     number
}

interface AiMsg {
  id:          string
  role:        'ai-assistant'
  query:       string
  answer:      string
  citations:   Citation[]
  usedSources: number
  error?:      string
}

type Msg = UserMsg | AsstMsg | AiMsg

// ── Static module-level data ───────────────────────────────────────────────────

const DOC_MAP = new Map(
  (documentsData.documents as DocRecord[]).map(d => [d.id, d.title])
)

const SUGGESTED_IDS = [
  'what-is-ambazonia',
  'what-is-southern-cameroons',
  'what-was-the-1961-plebiscite',
  'what-is-the-anglophone-crisis',
  'what-is-the-fira',
  'is-ambazonia-recognized',
  'what-is-the-scnc',
  'what-is-the-un-trusteeship-system',
]

const ESCALATE_TRIGGERS = ['human', 'contact', 'email', 'speak to someone']

// ── Copy text formatter ────────────────────────────────────────────────────────

function entryToCopyText(entry: FaqEntry): string {
  return [
    entry.question, '',
    entry.shortAnswer, '',
    'Detailed Analysis:',
    ...entry.deepAnswer.map(d => '  — ' + d), '',
    'Constitutional Continuity Argument:', '  ' + entry.ambazoniaClaim, '',
    'Cameroon Position:', '  ' + entry.cameroonPosition, '',
    'International Context:', '  ' + entry.internationalContext,
  ].join('\n')
}

// ── API call ───────────────────────────────────────────────────────────────────

async function fetchAiAnswer(
  question:   string,
  maxSources: number,
): Promise<{ answer: string; citations: Citation[]; usedSources: number } | { error: string; code?: string }> {
  const resp = await fetch('/api/chat', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ question, mode: 'ai', maxSources }),
  })

  if (resp.status === 429) return { error: 'Rate limit reached. Please wait a few minutes before using AI mode again.', code: 'RATE_LIMITED' }
  if (resp.status === 503) return { error: 'AI enhanced answers are not available on this deployment. Using deterministic mode instead.', code: 'LLM_NOT_CONFIGURED' }

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({})) as { error?: string }
    return { error: data.error ?? `Server error (${resp.status}).`, code: 'API_ERROR' }
  }

  const data = await resp.json() as {
    answer:    string
    citations: Citation[]
    limits:    { usedSources: number }
  }
  return { answer: data.answer, citations: data.citations, usedSources: data.limits.usedSources }
}

// Strip [D:id] / [F:id] citation markers from displayed answer text
function stripCitationMarkers(text: string): string {
  return text.replace(/\s*\[[DF]:[^\]]{1,120}\]/g, '').trim()
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Chat() {
  const [allEntries, setAllEntries] = useState<FaqEntry[]>([])
  const [faqLoaded, setFaqLoaded]   = useState(false)
  const [messages, setMessages]     = useState<Msg[]>([])
  const [input, setInput]           = useState('')
  const [copiedId, setCopiedId]     = useState<string | null>(null)
  const [aiMode, setAiMode]         = useState(false)
  const [aiLoading, setAiLoading]   = useState(false)
  const bottomRef                   = useRef<HTMLDivElement>(null)

  const [escalateOpen, setEscalateOpen]         = useState(false)
  const [escalateMsg, setEscalateMsg]           = useState('')
  const [escalateEmail, setEscalateEmail]       = useState('')
  const [escalateStatus, setEscalateStatus]     = useState<'idle' | 'sending' | 'sent' | 'fallback' | 'error'>('idle')
  const [escalateFallback, setEscalateFallback] = useState<string | null>(null)

  // Lazy-load FAQ JSON — separate Vite chunk
  useEffect(() => {
    import('../../data/orientation_faq.json').then(mod => {
      const data = (mod as { default: { entries: FaqEntry[] } }).default
      setAllEntries(data.entries)
      setFaqLoaded(true)
    })
  }, [])

  // Scroll to latest message
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ block: 'end' })
    }
  }, [messages])

  const suggested = useMemo<FaqEntry[]>(
    () => SUGGESTED_IDS
      .map(id => allEntries.find(e => e.id === id))
      .filter((e): e is FaqEntry => e !== undefined),
    [allEntries]
  )

  function submitDeterministic(text: string) {
    const q    = text.trim()
    const ts   = Date.now()
    const userMsg: UserMsg = { id: `u${ts}`, role: 'user', text: q }
    const resp = computeDeterministicMatch(allEntries, q)
    const asstMsg: AsstMsg = {
      id:        `a${ts}`,
      role:      'assistant',
      query:     q,
      entry:     resp.entry,
      fallbacks: resp.fallbacks,
      score:     resp.score,
    }
    setMessages(prev => [...prev, userMsg, asstMsg])
    setInput('')
  }

  async function submitAi(text: string) {
    const q  = text.trim()
    const ts = Date.now()
    const userMsg: UserMsg = { id: `u${ts}`, role: 'user', text: q }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setAiLoading(true)

    try {
      const result = await fetchAiAnswer(q, 6)

      if ('error' in result) {
        // 503 / rate-limit: show error inline; for other errors fall back to deterministic
        if (result.code === 'LLM_NOT_CONFIGURED' || result.code === 'RATE_LIMITED') {
          const aiMsg: AiMsg = {
            id: `ai${ts}`, role: 'ai-assistant', query: q,
            answer: '', citations: [], usedSources: 0, error: result.error,
          }
          setMessages(prev => [...prev, aiMsg])
        } else {
          // Network / unknown error → deterministic fallback
          const resp    = computeDeterministicMatch(allEntries, q)
          const asstMsg: AsstMsg = {
            id: `a${ts}`, role: 'assistant', query: q,
            entry: resp.entry, fallbacks: resp.fallbacks, score: resp.score,
          }
          setMessages(prev => [...prev, asstMsg])
        }
      } else {
        const aiMsg: AiMsg = {
          id: `ai${ts}`, role: 'ai-assistant', query: q,
          answer:      result.answer,
          citations:   result.citations,
          usedSources: result.usedSources,
        }
        setMessages(prev => [...prev, aiMsg])
      }
    } catch {
      // Network failure → deterministic fallback
      const resp    = computeDeterministicMatch(allEntries, q)
      const asstMsg: AsstMsg = {
        id: `a${ts}`, role: 'assistant', query: q,
        entry: resp.entry, fallbacks: resp.fallbacks, score: resp.score,
      }
      setMessages(prev => [...prev, asstMsg])
    } finally {
      setAiLoading(false)
    }
  }

  function submit(text: string) {
    const q = text.trim()
    if (!q || !faqLoaded || aiLoading) return
    const lower = q.toLowerCase()
    if (ESCALATE_TRIGGERS.some(t => lower.includes(t)) && !escalateOpen) {
      setEscalateMsg(q)
      setEscalateOpen(true)
      setEscalateStatus('idle')
    }
    if (aiMode) submitAi(q)
    else submitDeterministic(q)
  }

  async function submitEscalation() {
    if (!escalateMsg.trim()) return
    setEscalateStatus('sending')
    const lastAiMsg = [...messages].reverse().find((m): m is AiMsg => m.role === 'ai-assistant')
    const citations = lastAiMsg?.citations.slice(0, 4).map(c => ({
      title: c.title,
      url:   c.url,
      why:   c.why,
    }))
    try {
      const resp = await fetch('/api/escalate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:     escalateMsg,
          email:       escalateEmail.trim() || undefined,
          citations,
          pageContext: 'Research Chat',
          timestamp:   new Date().toISOString(),
        }),
      })
      if (!resp.ok) { setEscalateStatus('error'); return }
      const data = await resp.json() as { ok: boolean; fallback?: string; mailto?: string }
      if (!data.ok && data.fallback === 'mailto' && data.mailto) {
        setEscalateFallback(data.mailto)
        setEscalateStatus('fallback')
      } else if (data.ok) {
        setEscalateStatus('sent')
      } else {
        setEscalateStatus('error')
      }
    } catch {
      setEscalateStatus('error')
    }
  }

  async function handleCopy(msg: AsstMsg) {
    if (!msg.entry) return
    const ok = await copyToClipboard(entryToCopyText(msg.entry))
    if (ok) {
      setCopiedId(msg.id)
      setTimeout(() => setCopiedId(curr => curr === msg.id ? null : curr), 2000)
    }
  }

  function clearChat() {
    setMessages([])
    setInput('')
  }

  const isEmpty = messages.length === 0

  return (
    <PageContainer
      breadcrumbOverrides={[
        { label: 'Home',     path: '/' },
        { label: 'Research', path: '/research/inquiry' },
        { label: 'Chat' },
      ]}
    >
      <RouteMeta
        title="Research Chat — Republic of Ambazonia Archive"
        description="Deterministic, document-grounded conversational orientation using the institutional archive."
        canonical={`${siteUrl}/research/chat`}
      />
      <JsonLd id="jsonld-webpage-chat" data={CHAT_WEBPAGE_SCHEMA} />

      {/* Page header */}
      <div className="mb-8">
        <div className="h-px w-10 bg-gold-500 mb-5" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-navy-900 text-3xl mb-2">
              Research Chat — Ambazonia Orientation
            </h1>
            <p className="text-sm font-sans text-navy-700/55 leading-relaxed max-w-xl">
              Answers drawn from the institutional FAQ and document archive.
              All responses are citation-bound to curated archive data — no invented facts.
            </p>
          </div>
          {!isEmpty && (
            <button
              onClick={clearChat}
              className="shrink-0 text-xs font-sans border border-slate-200 px-3 py-1.5 text-navy-700/50 hover:border-slate-300 hover:text-navy-700 transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>
      </div>

      {/* Suggested starters — shown when chat is empty */}
      {isEmpty && (
        <div className="mb-8">
          {!faqLoaded ? (
            <div className="space-y-2 max-w-lg" aria-hidden="true">
              {[...Array(3)].map((_, i) => <div key={i} className="h-7 bg-slate-100" />)}
            </div>
          ) : (
            <>
              <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-3">
                Suggested questions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggested.map(e => (
                  <button
                    key={e.id}
                    onClick={() => submit(e.question)}
                    className="text-xs font-sans px-3 py-1.5 border border-slate-200 text-navy-700/60 hover:border-gold-400 hover:text-navy-900 transition-colors"
                  >
                    {e.question}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Message list */}
      {(!isEmpty || aiLoading) && (
        <div
          className="border border-slate-200 overflow-y-auto mb-4"
          style={{ maxHeight: '62vh' }}
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map(msg => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="px-5 py-4 border-b border-slate-100 bg-parchment-50/50">
                  <p className="text-xs font-sans text-navy-700/35 uppercase tracking-widest mb-1.5">You</p>
                  <p className="text-sm font-sans text-navy-700 leading-relaxed">{msg.text}</p>
                </div>
              )
            }

            // ── AI-assistant message ──────────────────────────────────────────
            if (msg.role === 'ai-assistant') {
              return (
                <div key={msg.id} className="px-5 py-5 border-b border-slate-100">
                  <p className="text-xs font-sans text-navy-700/35 uppercase tracking-widest mb-4">
                    Archive <span className="text-gold-600/60">(AI)</span>
                  </p>

                  {msg.error ? (
                    <p className="text-sm font-sans text-navy-700/60 leading-relaxed italic">
                      {msg.error}
                    </p>
                  ) : (
                    <>
                      {/* Answer text — citation markers stripped, split into paragraphs */}
                      <div className="space-y-3 mb-5">
                        {stripCitationMarkers(msg.answer)
                          .split(/\n{2,}/)
                          .filter(Boolean)
                          .map((para, i) => (
                            <p key={i} className="text-sm font-sans text-navy-700/80 leading-relaxed">
                              {para.trim()}
                            </p>
                          ))}
                      </div>

                      {/* Citations */}
                      {msg.citations.length > 0 && (
                        <div className="border-t border-slate-100 pt-4 mb-3">
                          <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-3">
                            Sources ({msg.usedSources} retrieved)
                          </p>
                          <ul className="space-y-3">
                            {msg.citations.map(c => (
                              <li key={c.id} className="border-l-2 border-slate-200 pl-3">
                                <Link
                                  to={c.url}
                                  className="text-sm font-sans text-gold-600 hover:text-gold-700 underline underline-offset-2 transition-colors block leading-snug"
                                >
                                  {c.title}
                                </Link>
                                <p className="text-xs font-sans text-navy-700/45 mt-0.5 leading-snug">
                                  {c.why}
                                </p>
                                {c.quote && c.quote !== c.title && (
                                  <p className="text-xs font-sans text-navy-700/40 mt-1 leading-relaxed italic">
                                    "{c.quote.slice(0, 180)}{c.quote.length > 180 ? '…' : ''}"
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            }

            // ── Deterministic assistant message ───────────────────────────────
            return (
              <div key={msg.id} className="px-5 py-5 border-b border-slate-100">
                <p className="text-xs font-sans text-navy-700/35 uppercase tracking-widest mb-4">Archive</p>

                {msg.entry ? (
                  <>
                    <p className="text-sm font-sans text-navy-700/80 leading-relaxed mb-5">
                      {msg.entry.shortAnswer}
                    </p>

                    <details className="mb-5">
                      <summary className="text-xs font-sans text-navy-700/40 uppercase tracking-widest cursor-pointer select-none hover:text-navy-700/60 transition-colors mb-2">
                        Detailed Analysis
                      </summary>
                      <ul className="mt-3 space-y-2 pl-1">
                        {msg.entry.deepAnswer.map((d, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span
                              className="text-xs shrink-0 pt-0.5"
                              style={{ color: 'rgba(200,176,112,0.50)' }}
                              aria-hidden="true"
                            >—</span>
                            <span className="text-sm font-sans text-navy-700/65 leading-relaxed">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </details>

                    <div className="space-y-3 mb-5">
                      <div className="border-l-2 border-gold-500/40 pl-3 py-0.5">
                        <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-1">Constitutional Continuity Argument</p>
                        <p className="text-sm font-sans text-navy-700/65 leading-relaxed">{msg.entry.ambazoniaClaim}</p>
                      </div>
                      <div className="border-l-2 border-slate-200 pl-3 py-0.5">
                        <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-1">Cameroon Position</p>
                        <p className="text-sm font-sans text-navy-700/65 leading-relaxed">{msg.entry.cameroonPosition}</p>
                      </div>
                      <div className="border-l-2 border-slate-200 pl-3 py-0.5">
                        <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-1">International Context</p>
                        <p className="text-sm font-sans text-navy-700/65 leading-relaxed">{msg.entry.internationalContext}</p>
                      </div>
                    </div>

                    {msg.entry.relatedDocuments.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-2">Related Documents</p>
                        <ul className="space-y-1">
                          {msg.entry.relatedDocuments.map(docId => (
                            <li key={docId}>
                              <Link
                                to={`/documents/${docId}`}
                                className="text-sm font-sans text-gold-600 hover:text-gold-700 underline underline-offset-2 transition-colors"
                              >
                                {DOC_MAP.get(docId) ?? docId}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={() => handleCopy(msg)}
                      className="text-xs font-sans border border-slate-200 px-2.5 py-1 text-navy-700/50 hover:border-gold-400 hover:text-navy-700 transition-colors"
                    >
                      {copiedId === msg.id ? 'Copied' : 'Copy Answer'}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-sans text-navy-700/70 leading-relaxed mb-4">
                      I don't have a direct entry for that exact question yet.
                      {msg.fallbacks.length > 0 && ' The closest matches in the archive are:'}
                    </p>
                    {msg.fallbacks.length > 0 && (
                      <ul className="space-y-2 mb-5">
                        {msg.fallbacks.map(e => (
                          <li key={e.id}>
                            <button
                              onClick={() => submit(e.question)}
                              className="text-sm font-sans text-gold-600 hover:text-gold-700 text-left underline underline-offset-2 transition-colors"
                            >
                              {e.question}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-xs font-sans text-navy-700/40 leading-relaxed">
                      Browse all questions at{' '}
                      <Link to="/research/orientation" className="text-gold-600 hover:text-gold-700 underline underline-offset-2 transition-colors">
                        Orientation
                      </Link>
                      {' '}or search primary documents at{' '}
                      <Link to="/research/inquiry" className="text-gold-600 hover:text-gold-700 underline underline-offset-2 transition-colors">
                        Document Search
                      </Link>.
                    </p>
                  </>
                )}
              </div>
            )
          })}

          {/* Loading indicator while AI is working */}
          {aiLoading && (
            <div className="px-5 py-5 border-b border-slate-100">
              <p className="text-xs font-sans text-navy-700/35 uppercase tracking-widest mb-3">
                Archive <span className="text-gold-600/60">(AI)</span>
              </p>
              <p className="text-sm font-sans text-navy-700/40 italic">Retrieving and synthesising sources…</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {/* Input area */}
      <div className="max-w-2xl">
        <div className="flex gap-2 mb-3">
          <label htmlFor="chat-input" className="sr-only">Ask a question</label>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(input) } }}
            placeholder={faqLoaded ? 'Ask a question about Ambazonia…' : 'Loading…'}
            disabled={!faqLoaded || aiLoading}
            className="flex-1 border border-slate-200 px-4 py-2.5 text-sm font-sans text-navy-900 placeholder:text-navy-700/35 focus:outline-none focus:border-gold-400 bg-white disabled:opacity-40"
          />
          <button
            onClick={() => submit(input)}
            disabled={!faqLoaded || !input.trim() || aiLoading}
            className="px-5 py-2.5 text-sm font-sans bg-navy-900 text-parchment-100 hover:bg-navy-800 transition-colors disabled:opacity-30"
          >
            Send
          </button>
        </div>

        {/* AI mode toggle + Request Human Review */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setAiMode(v => !v)}
            className={
              'text-xs font-sans border px-3 py-1.5 transition-colors ' +
              (aiMode
                ? 'border-gold-500 bg-gold-500/10 text-navy-900'
                : 'border-slate-200 text-navy-700/50 hover:border-gold-400 hover:text-navy-700')
            }
            aria-pressed={aiMode}
          >
            {aiMode ? 'Enhanced Answer (AI) — ON' : 'Enhanced Answer (AI)'}
          </button>
          {aiMode && (
            <p className="text-xs font-sans text-navy-700/40">
              AI mode is citation-bound to archive sources.
            </p>
          )}
          <button
            onClick={() => {
              setEscalateOpen(v => !v)
              setEscalateStatus('idle')
              setEscalateFallback(null)
            }}
            className={
              'text-xs font-sans border px-3 py-1.5 transition-colors ml-auto ' +
              (escalateOpen
                ? 'border-gold-500 bg-gold-500/10 text-navy-900'
                : 'border-slate-200 text-navy-700/50 hover:border-gold-400 hover:text-navy-700')
            }
          >
            Request Human Review
          </button>
        </div>
      </div>

      {/* Human escalation panel */}
      {escalateOpen && (
        <div className="max-w-2xl mt-4 border border-slate-200 p-5">
          <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-4">
            Request Human Review
          </p>

          {escalateStatus === 'sent' ? (
            <p className="text-sm font-sans text-navy-700/70 leading-relaxed">
              Your request has been forwarded to the archive team. We will be in touch if you provided a contact email.
            </p>
          ) : escalateStatus === 'fallback' && escalateFallback ? (
            <div>
              <p className="text-sm font-sans text-navy-700/70 leading-relaxed mb-3">
                Direct delivery is currently unavailable. Use the link below to send your request by email:
              </p>
              <a
                href={escalateFallback}
                className="text-sm font-sans text-gold-600 hover:text-gold-700 underline underline-offset-2 transition-colors"
              >
                Open in email client
              </a>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                <div>
                  <label htmlFor="escalate-msg" className="text-xs font-sans text-navy-700/50 mb-1 block">
                    Message
                  </label>
                  <textarea
                    id="escalate-msg"
                    rows={3}
                    value={escalateMsg}
                    onChange={e => setEscalateMsg(e.target.value)}
                    placeholder="Describe what you need human assistance with…"
                    className="w-full border border-slate-200 px-3 py-2 text-sm font-sans text-navy-900 placeholder:text-navy-700/30 focus:outline-none focus:border-gold-400 bg-white resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="escalate-email" className="text-xs font-sans text-navy-700/50 mb-1 block">
                    Your email (optional — for a reply)
                  </label>
                  <input
                    id="escalate-email"
                    type="email"
                    value={escalateEmail}
                    onChange={e => setEscalateEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-slate-200 px-3 py-2 text-sm font-sans text-navy-900 placeholder:text-navy-700/30 focus:outline-none focus:border-gold-400 bg-white"
                  />
                </div>
              </div>

              {escalateStatus === 'error' && (
                <p className="text-xs font-sans text-red-600/70 mb-3">
                  Delivery failed. Please try again or contact us directly.
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => { void submitEscalation() }}
                  disabled={!escalateMsg.trim() || escalateStatus === 'sending'}
                  className="text-xs font-sans border border-slate-300 px-4 py-1.5 text-navy-700/70 hover:border-gold-400 hover:text-navy-900 transition-colors disabled:opacity-40"
                >
                  {escalateStatus === 'sending' ? 'Sending…' : 'Submit Request'}
                </button>
                <button
                  onClick={() => setEscalateOpen(false)}
                  className="text-xs font-sans text-navy-700/35 hover:text-navy-700/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer note */}
      <p className="text-xs font-sans text-navy-700/25 mt-4 max-w-2xl leading-relaxed">
        {aiMode
          ? 'AI responses are constrained to retrieved archive sources and include explicit citations.'
          : 'Responses are generated deterministically from curated FAQ data.'}
        {' '}For primary-source research, use{' '}
        <Link to="/research/inquiry" className="underline underline-offset-2 hover:text-navy-700/50 transition-colors">
          Document Search
        </Link>.
      </p>
    </PageContainer>
  )
}
