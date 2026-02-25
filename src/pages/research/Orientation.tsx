import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer, PageHeading } from '../../components/layout/PageContainer'
import { RouteMeta } from '../../components/seo/RouteMeta'
import { copyToClipboard } from '../../lib/clipboard'
import { siteUrl } from '../../lib/env'
import faqData from '../../data/orientation_faq.json'
import documentsData from '../../data/documents.json'

interface FaqEntry {
  id:                  string
  question:            string
  shortAnswer:         string
  deepAnswer:          string[]
  ambazoniaClaim:      string
  cameroonPosition:    string
  internationalContext: string
  relatedDocuments:    string[]
  lastReviewed:        string
}

interface DocRecord {
  id:    string
  title: string
}

const ALL_ENTRIES = faqData.entries as FaqEntry[]

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

const SUGGESTED = SUGGESTED_IDS
  .map(id => ALL_ENTRIES.find(e => e.id === id))
  .filter((e): e is FaqEntry => e !== undefined)

function scoreEntry(entry: FaqEntry, query: string): number {
  const q = query.toLowerCase()
  let score = 0
  const questionLower = entry.question.toLowerCase()
  const shortLower    = entry.shortAnswer.toLowerCase()

  if (questionLower.includes(q)) score += 5

  const words = q.split(/\s+/).filter(w => w.length > 1)
  for (const w of words) {
    if (questionLower.includes(w))  score += 2
    if (shortLower.includes(w))     score += 1
    if (entry.deepAnswer.some(d => d.toLowerCase().includes(w))) score += 1
  }
  return score
}

export default function Orientation() {
  const [query, setQuery]             = useState('')
  const [debouncedQuery, setDebounced] = useState('')
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [copied, setCopied]           = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const filtered = useMemo<FaqEntry[]>(() => {
    const q = debouncedQuery.trim()
    if (!q) return ALL_ENTRIES
    return ALL_ENTRIES
      .map(e => ({ entry: e, score: scoreEntry(e, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ entry }) => entry)
  }, [debouncedQuery])

  const selected = useMemo<FaqEntry | null>(
    () => ALL_ENTRIES.find(e => e.id === selectedId) ?? null,
    [selectedId]
  )

  function selectEntry(id: string) {
    setSelectedId(id)
    setCopied(false)
    setQuery('')
  }

  async function handleCopy() {
    if (!selected) return
    const text = [
      selected.question,
      '',
      selected.shortAnswer,
      '',
      'Ambazonian claim: ' + selected.ambazoniaClaim,
      '',
      'Cameroon position: ' + selected.cameroonPosition,
      '',
      'International context: ' + selected.internationalContext,
    ].join('\n')
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <PageContainer
      breadcrumbOverrides={[
        { label: 'Home',     path: '/' },
        { label: 'Research', path: '/research/inquiry' },
        { label: 'Orientation' },
      ]}
    >
      <RouteMeta
        title="Orientation — Republic of Ambazonia Archive"
        description="Structured overview of the historical, legal, and political dimensions of the Ambazonia question."
        canonical={`${siteUrl}/research/orientation`}
      />

      <PageHeading
        title="Orientation: Understanding the Ambazonia Question"
        subtitle="A structured reference covering the historical, legal, and political dimensions of the question. Each entry presents a factual summary alongside the distinct positions of the independence movement, the Cameroon government, and the international community."
      />

      {/* Suggested starting points */}
      <div className="mb-10">
        <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-4">
          Suggested Starting Points
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map(e => (
            <button
              key={e.id}
              onClick={() => selectEntry(e.id)}
              className={
                'text-xs font-sans px-3 py-1.5 border transition-colors ' +
                (selectedId === e.id
                  ? 'border-gold-500 bg-gold-500/10 text-navy-900'
                  : 'border-slate-200 text-navy-700/60 hover:border-gold-400 hover:text-navy-900')
              }
            >
              {e.question}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-lg">
        <label htmlFor="orientation-search" className="sr-only">Search questions</label>
        <input
          id="orientation-search"
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="w-full border border-slate-200 px-4 py-2.5 text-sm font-sans text-navy-900 placeholder:text-navy-700/35 focus:outline-none focus:border-gold-400 bg-white"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Question list */}
        <aside className="lg:w-72 shrink-0">
          {filtered.length === 0 ? (
            <p className="text-sm font-sans text-navy-700/40 italic">No matching questions.</p>
          ) : (
            <ul className="space-y-1">
              {filtered.map(e => (
                <li key={e.id}>
                  <button
                    onClick={() => selectEntry(e.id)}
                    className={
                      'w-full text-left text-sm font-sans px-3 py-2.5 border-l-2 transition-colors leading-snug ' +
                      (selectedId === e.id
                        ? 'border-l-gold-500 text-navy-900 bg-parchment-50'
                        : 'border-l-transparent text-navy-700/65 hover:text-navy-900 hover:border-l-gold-300')
                    }
                  >
                    {e.question}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Detail panel */}
        <div className="flex-1 min-w-0">
          {selected === null ? (
            <div className="border border-slate-100 p-8 text-center">
              <p className="text-sm font-sans text-navy-700/35">
                Select a question to read the entry.
              </p>
            </div>
          ) : (
            <article key={selected.id} aria-labelledby="entry-question">
              <h2
                id="entry-question"
                className="font-serif text-navy-900 text-2xl mb-4 leading-snug"
              >
                {selected.question}
              </h2>

              <p className="text-sm font-sans text-navy-700/75 leading-relaxed mb-6">
                {selected.shortAnswer}
              </p>

              {/* Expandable deep answer */}
              <details key={`deep-${selected.id}`} className="mb-8 group">
                <summary className="text-xs font-sans text-navy-700/45 uppercase tracking-widest cursor-pointer select-none hover:text-navy-700/70 transition-colors mb-3">
                  Detailed Analysis
                </summary>
                <ul className="mt-3 space-y-2 pl-1">
                  {selected.deepAnswer.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="text-xs shrink-0 pt-0.5"
                        style={{ color: 'rgba(200,176,112,0.50)' }}
                        aria-hidden="true"
                      >
                        —
                      </span>
                      <span className="text-sm font-sans text-navy-700/70 leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>

              {/* Three position blocks */}
              <div className="space-y-4 mb-8">
                <div className="border-l-2 border-gold-500/40 pl-4 py-1">
                  <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-1.5">
                    Ambazonian Claim
                  </p>
                  <p className="text-sm font-sans text-navy-700/70 leading-relaxed">
                    {selected.ambazoniaClaim}
                  </p>
                </div>

                <div className="border-l-2 border-slate-200 pl-4 py-1">
                  <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-1.5">
                    Cameroon Position
                  </p>
                  <p className="text-sm font-sans text-navy-700/70 leading-relaxed">
                    {selected.cameroonPosition}
                  </p>
                </div>

                <div className="border-l-2 border-slate-200 pl-4 py-1">
                  <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-1.5">
                    International Context
                  </p>
                  <p className="text-sm font-sans text-navy-700/70 leading-relaxed">
                    {selected.internationalContext}
                  </p>
                </div>
              </div>

              {/* Related documents */}
              {selected.relatedDocuments.length > 0 && (
                <section className="mb-8" aria-labelledby="related-docs-heading">
                  <div className="h-px w-6 bg-gold-500/40 mb-4" />
                  <h3
                    id="related-docs-heading"
                    className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-3"
                  >
                    Related Documents
                  </h3>
                  <ul className="space-y-2">
                    {selected.relatedDocuments.map(docId => {
                      const title = DOC_MAP.get(docId) ?? docId
                      return (
                        <li key={docId}>
                          <Link
                            to={`/documents/${docId}`}
                            className="text-sm font-sans text-gold-600 hover:text-gold-700 underline underline-offset-2 transition-colors leading-snug block"
                          >
                            {title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )}

              {/* Copy summary */}
              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={handleCopy}
                  className="text-xs font-sans border border-slate-200 px-3 py-1.5 text-navy-700/60 hover:border-gold-400 hover:text-navy-900 transition-colors"
                >
                  {copied ? 'Copied' : 'Copy Summary'}
                </button>
                <p className="text-xs font-sans text-navy-700/30 mt-2">
                  Last reviewed: {selected.lastReviewed}
                </p>
              </div>
            </article>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
