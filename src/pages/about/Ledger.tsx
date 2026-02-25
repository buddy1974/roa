import { PageContainer, PageHeading } from '../../components/layout/PageContainer'
import { RouteMeta } from '../../components/seo/RouteMeta'
import { siteUrl } from '../../lib/env'
import ledgerData from '../../data/ledger.json'

interface LedgerEntry {
  date:        string
  phase:       string
  type:        string
  field:       string
  summary:     string
  detail:      string
  affectedIds: string[]
  authorisedBy: string
}

const entries = ledgerData.entries as LedgerEntry[]

export default function Ledger() {
  return (
    <PageContainer
      breadcrumbOverrides={[
        { label: 'Home', path: '/' },
        { label: 'Ledger' },
      ]}
    >
      <RouteMeta
        title="Document Change Ledger — Republic of Ambazonia"
        description="Authoritative record of all corrections, migrations, and additions made to the Federal Republic of Ambazonia institutional document archive."
        canonical={`${siteUrl}/about/ledger`}
      />

      <PageHeading
        title="Document Change Ledger"
        subtitle="Authoritative record of all corrections, migrations, and additions to this archive, in reverse chronological order."
      />

      <div className="space-y-8 max-w-3xl">
        {entries.map((entry, i) => (
          <section
            key={i}
            className="border border-slate-200 p-6"
            aria-labelledby={`ledger-${i}`}
          >
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
              <h2
                id={`ledger-${i}`}
                className="font-serif text-navy-900 text-lg"
              >
                {entry.summary}
              </h2>
              <span className="text-xs font-sans text-navy-700/40 tabular-nums">
                {entry.date}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-xs font-sans">
              <span className="uppercase tracking-widest text-navy-700/50">{entry.phase}</span>
              <span className="text-gold-500/40 select-none">·</span>
              <span className="text-navy-700/50">{entry.type}</span>
              <span className="text-gold-500/40 select-none">·</span>
              <span className="text-navy-700/40">Field: {entry.field}</span>
            </div>

            <p className="text-sm font-sans text-navy-700/70 leading-relaxed mb-4">
              {entry.detail}
            </p>

            {entry.affectedIds.length > 0 && (
              <div className="border-t border-slate-100 pt-3 mt-3">
                <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-2">
                  Affected IDs
                </p>
                <ul className="space-y-1">
                  {entry.affectedIds.map((id, j) => (
                    <li key={j}>
                      <code className="text-xs font-mono text-navy-700/60 bg-slate-50 px-1.5 py-0.5">
                        {id}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 mt-3">
              <p className="text-xs font-sans text-navy-700/35">
                Authorised by: {entry.authorisedBy}
              </p>
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  )
}
