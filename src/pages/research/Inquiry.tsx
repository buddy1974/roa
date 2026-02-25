import { useState, useMemo, useEffect, useRef } from 'react'
import { PageContainer, PageHeading } from '../../components/layout/PageContainer'
import { type Document } from '../../components/documents/DocumentCard'
import documentsData from '../../data/documents.json'

const ALL_DOCS = documentsData.documents as Document[]

// ── Relevance scoring ────────────────────────────────────────────────────────

function scoreDocument(doc: Document, query: string): number {
  const q = query.toLowerCase().trim()
  if (!q) return 0

  const words = q.split(/\s+/).filter(w => w.length > 2)
  const title    = doc.title.toLowerCase()
  const category = doc.category.toLowerCase()
  const sections = doc.relatedSections.map(s => s.toLowerCase())

  let score = 0

  // Title — exact phrase match
  if (title.includes(q)) score += 10
  for (const w of words) {
    if (title.includes(w)) score += 3
  }

  // Category — bidirectional containment
  if (q.includes(category) || category.includes(q)) score += 5
  for (const w of words) {
    if (category.includes(w)) score += 2
  }

  // Year — exact match
  if (doc.year && q.includes(doc.year)) score += 8

  // Related section keyword overlap
  for (const s of sections) {
    if (q.includes(s) || s.includes(q)) score += 4
    for (const w of words) {
      if (s.includes(w)) score += 2
    }
  }

  return score
}

// ── Category badge ───────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  historical:     { bg: '#edf1f7', color: '#002448', label: 'Historical' },
  un:             { bg: '#e8f0fa', color: '#003C80', label: 'UN' },
  constitutional: { bg: '#fdf8ed', color: '#7a5800', label: 'Constitutional' },
  ordinance:      { bg: '#edf4ed', color: '#1e4a1e', label: 'Ordinance' },
  international:  { bg: '#edf5f1', color: '#1a4035', label: 'International' },
  legal:          { bg: '#fef9e7', color: '#6b4a00', label: 'Legal' },
  proclamation:   { bg: '#fdeeed', color: '#6b2020', label: 'Proclamation' },
}

function CategoryBadge({ category }: { category: string }) {
  const s = CATEGORY_STYLES[category] ?? { bg: '#f0f0f0', color: '#444', label: category }
  return (
    <span
      className="inline-block text-xs font-sans px-2 py-0.5 tracking-wide whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

// ── Debounce hook ────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Inquiry() {
  const [query, setQuery]   = useState('')
  const debouncedQuery      = useDebounce(query, 300)
  const inputRef            = useRef<HTMLInputElement>(null)

  const results = useMemo<Document[]>(() => {
    const q = debouncedQuery.trim()
    if (!q) return []
    return ALL_DOCS
      .map(doc => ({ doc, score: scoreDocument(doc, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ doc }) => doc)
  }, [debouncedQuery])

  const hasQuery = debouncedQuery.trim().length > 0

  return (
    <PageContainer
      breadcrumbOverrides={[
        { label: 'Home', path: '/' },
        { label: 'Research & Inquiry' },
      ]}
    >
      <PageHeading
        title="Research & Inquiry"
        subtitle="Query the institutional document archive by keyword, category, or year. Results are ranked by relevance. No AI inference is applied — only direct document retrieval."
      />

      {/* ── Search input ─────────────────────────────────────────── */}
      <div className="mb-10">
        <label
          htmlFor="inquiry-input"
          className="block text-xs font-sans uppercase tracking-widest mb-2"
          style={{ color: 'rgba(0,36,72,0.50)' }}
        >
          Enter inquiry
        </label>

        <div className="relative max-w-2xl">
          <input
            id="inquiry-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. trusteeship, plebiscite, 1961, ordinance, ICJ…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-white font-sans text-sm px-4 py-3 focus:outline-none"
            style={{
              color:        '#001020',
              border:       '1px solid #C4CED8',
              borderBottom: '2px solid #C8B070',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans"
              style={{ color: 'rgba(0,36,72,0.35)' }}
            >
              ✕
            </button>
          )}
        </div>

        <p className="mt-2 text-xs font-sans" style={{ color: 'rgba(0,36,72,0.38)' }}>
          Matches title, category, year, and document keywords. Results sorted by relevance score.
        </p>
      </div>

      {/* ── Results ──────────────────────────────────────────────── */}
      {hasQuery && (
        <section aria-label="Search results">
          {/* Count row */}
          <div
            className="flex items-center gap-4 mb-5 pb-3"
            style={{ borderBottom: '1px solid #C4CED8' }}
          >
            <span
              className="text-xs font-sans uppercase tracking-widest"
              style={{ color: 'rgba(0,36,72,0.45)' }}
            >
              {results.length === 0
                ? 'No documents matched'
                : `${results.length} document${results.length !== 1 ? 's' : ''} matched`}
            </span>
            {results.length > 0 && (
              <span className="text-xs font-sans" style={{ color: 'rgba(200,176,112,0.80)' }}>
                Ranked by relevance
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-sans" style={{ color: 'rgba(0,36,72,0.42)' }}>
                No documents in the archive match your query.
              </p>
              <p className="text-xs font-sans mt-2" style={{ color: 'rgba(0,36,72,0.28)' }}>
                Try broader terms or alternative keywords.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table ── md and above */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #C4CED8' }}>
                      <th
                        className="pr-4 py-3 text-xs font-sans uppercase tracking-widest font-normal"
                        style={{ color: 'rgba(0,36,72,0.48)', width: '2rem' }}
                      >
                        #
                      </th>
                      <th
                        className="pr-6 py-3 text-xs font-sans uppercase tracking-widest font-normal"
                        style={{ color: 'rgba(0,36,72,0.48)' }}
                      >
                        Document Title
                      </th>
                      <th
                        className="px-4 py-3 text-xs font-sans uppercase tracking-widest font-normal whitespace-nowrap"
                        style={{ color: 'rgba(0,36,72,0.48)', width: '5rem' }}
                      >
                        Year
                      </th>
                      <th
                        className="px-4 py-3 text-xs font-sans uppercase tracking-widest font-normal"
                        style={{ color: 'rgba(0,36,72,0.48)', width: '9rem' }}
                      >
                        Category
                      </th>
                      <th
                        className="pl-4 py-3 text-xs font-sans uppercase tracking-widest font-normal"
                        style={{ color: 'rgba(0,36,72,0.48)', width: '6rem' }}
                      >
                        Download
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((doc, i) => (
                      <tr
                        key={doc.id}
                        style={{ borderBottom: '1px solid #edf1f7' }}
                      >
                        {/* Rank */}
                        <td className="pr-4 py-4 align-top">
                          <span
                            className="text-xs font-sans tabular-nums"
                            style={{ color: 'rgba(200,176,112,0.65)' }}
                          >
                            {i + 1}
                          </span>
                        </td>

                        {/* Title + keywords */}
                        <td className="pr-6 py-4 align-top">
                          <p
                            className="text-sm font-sans leading-snug"
                            style={{ color: '#001020' }}
                          >
                            {doc.title}
                          </p>
                          {doc.relatedSections.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {doc.relatedSections.map(s => (
                                <span
                                  key={s}
                                  className="text-xs font-sans"
                                  style={{ color: 'rgba(0,36,72,0.32)' }}
                                >
                                  #{s}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Year */}
                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          <span
                            className="text-sm font-sans tabular-nums"
                            style={{ color: 'rgba(0,36,72,0.52)' }}
                          >
                            {doc.year ?? '—'}
                          </span>
                        </td>

                        {/* Category badge */}
                        <td className="px-4 py-4 align-top">
                          <CategoryBadge category={doc.category} />
                        </td>

                        {/* Download */}
                        <td className="pl-4 py-4 align-top">
                          <a
                            href={doc.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-sans uppercase tracking-wide hover:underline"
                            style={{ color: '#C8B070' }}
                          >
                            PDF ↗
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards ── below md */}
              <div className="md:hidden flex flex-col gap-3">
                {results.map((doc, i) => (
                  <article
                    key={doc.id}
                    className="bg-white p-4"
                    style={{
                      border:     '1px solid #e0e8f0',
                      borderLeft: '2px solid #C8B070',
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <CategoryBadge category={doc.category} />
                      <span
                        className="text-xs font-sans tabular-nums"
                        style={{ color: 'rgba(0,36,72,0.42)' }}
                      >
                        {doc.year ?? '—'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <span
                        className="text-xs font-sans shrink-0"
                        style={{ color: 'rgba(200,176,112,0.70)' }}
                      >
                        {i + 1}.
                      </span>
                      <p
                        className="text-sm font-sans leading-snug"
                        style={{ color: '#001020' }}
                      >
                        {doc.title}
                      </p>
                    </div>

                    {doc.relatedSections.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1.5 pl-4">
                        {doc.relatedSections.map(s => (
                          <span
                            key={s}
                            className="text-xs font-sans"
                            style={{ color: 'rgba(0,36,72,0.32)' }}
                          >
                            #{s}
                          </span>
                        ))}
                      </div>
                    )}

                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-xs font-sans uppercase tracking-wide"
                      style={{ color: '#C8B070' }}
                    >
                      Download PDF ↗
                    </a>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* ── Empty state (before query) ───────────────────────────── */}
      {!hasQuery && (
        <div
          className="py-16 text-center"
          style={{ borderTop: '1px solid #edf1f7' }}
        >
          <div
            className="h-px w-8 mx-auto mb-6"
            style={{ backgroundColor: '#C8B070' }}
          />
          <p className="text-sm font-sans" style={{ color: 'rgba(0,36,72,0.40)' }}>
            Enter a search term to query the institutional document archive.
          </p>
          <p className="text-xs font-sans mt-2" style={{ color: 'rgba(0,36,72,0.25)' }}>
            {ALL_DOCS.length} documents indexed — no AI inference applied
          </p>
        </div>
      )}
    </PageContainer>
  )
}
