import { Link } from 'react-router-dom'
import { PageContainer, PageHeading } from '../../components/layout/PageContainer'
import { RouteMeta } from '../../components/seo/RouteMeta'
import { siteUrl } from '../../lib/env'
import type { Document } from '../../components/documents/DocumentCard'
import documentsData from '../../data/documents.json'

const ALL_DOCS = documentsData.documents as Document[]

const CATEGORY_ORDER = [
  'constitutional',
  'proclamation',
  'legal',
  'ordinance',
  'international',
  'un',
  'judicial',
  'historical',
] as const

const CATEGORY_LABELS: Record<string, string> = {
  constitutional: 'Constitutional Instruments',
  proclamation:   'State Proclamations',
  legal:          'Legal Instruments',
  ordinance:      'Legislative Ordinances',
  international:  'International Agreements',
  un:             'United Nations Submissions',
  judicial:       'Judicial Records',
  historical:     'Historical Archive',
}

// Computed once at module load — static data, no runtime state
const grouped: Array<{ cat: string; docs: Document[] }> = CATEGORY_ORDER
  .map(cat => ({
    cat,
    docs: ALL_DOCS
      .filter(d => d.category === cat)
      .sort((a, b) => {
        const ta = a.title.toLowerCase()
        const tb = b.title.toLowerCase()
        return ta < tb ? -1 : ta > tb ? 1 : 0
      }),
  }))
  .filter(({ docs }) => docs.length > 0)

export default function ConstitutionalIndex() {
  return (
    <PageContainer
      breadcrumbOverrides={[
        { label: 'Home', path: '/' },
        { label: 'Constitutional Index' },
      ]}
    >
      <RouteMeta
        title="Constitutional Index — Republic of Ambazonia"
        description="Thematic classification of the institutional document archive of the Federal Republic of Ambazonia, organised by constitutional, legal, and historical category."
        canonical={`${siteUrl}/index`}
      />

      <PageHeading
        title="Constitutional Index"
        subtitle="Thematic classification of the institutional archive. Documents are grouped by legal category and ordered alphabetically within each group."
      />

      <div className="space-y-14">
        {grouped.map(({ cat, docs }) => (
          <section key={cat} aria-labelledby={`section-${cat}`}>
            <div className="flex items-baseline gap-4 mb-3">
              <h2
                id={`section-${cat}`}
                className="font-serif text-navy-900 text-xl"
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </h2>
              <span className="text-xs font-sans text-navy-700/40 tabular-nums">
                {docs.length} document{docs.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="h-px w-6 bg-gold-500 mb-5" />

            <ul className="space-y-2.5">
              {docs.map(doc => (
                <li key={doc.id} className="flex items-start gap-4">
                  <span className="text-xs font-sans text-navy-700/35 tabular-nums pt-0.5 w-8 shrink-0 text-right">
                    {doc.year ?? '—'}
                  </span>
                  <Link
                    to={`/documents/${doc.id}`}
                    className="text-sm font-sans text-navy-900 hover:text-gold-600 transition-colors leading-snug"
                  >
                    {doc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageContainer>
  )
}
