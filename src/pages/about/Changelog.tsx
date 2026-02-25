import { PageContainer, PageHeading } from '../../components/layout/PageContainer'
import { RouteMeta } from '../../components/seo/RouteMeta'
import { EnvWarning } from '../../components/ui/EnvWarning'
import { siteUrl } from '../../lib/env'
import changelogData from '../../data/changelog.json'
import buildInfo from '../../data/build-info.json'

interface ChangelogEntry {
  version: string
  date:    string
  type:    string
  summary: string
  changes: string[]
}

const entries = changelogData.entries as ChangelogEntry[]

export default function Changelog() {
  return (
    <PageContainer
      breadcrumbOverrides={[
        { label: 'Home', path: '/' },
        { label: 'Changelog' },
      ]}
    >
      <RouteMeta
        title="System Changelog — Republic of Ambazonia"
        description="Record of changes to the Federal Republic of Ambazonia institutional archive platform, in reverse chronological order."
        canonical={`${siteUrl}/about/changelog`}
      />

      <PageHeading
        title="System Changelog"
        subtitle="Record of changes to the institutional archive platform, in reverse chronological order."
      />

      <EnvWarning />

      <div className="space-y-10 max-w-3xl">
        {entries.map((entry, i) => (
          <section
            key={i}
            className="border-l-2 border-gold-500/30 pl-6"
            aria-labelledby={`entry-${i}`}
          >
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
              <h2
                id={`entry-${i}`}
                className="font-serif text-navy-900 text-lg"
              >
                {entry.summary}
              </h2>
              <span className="text-xs font-sans text-navy-700/40 tabular-nums">
                {entry.date}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-sans text-navy-700/50 uppercase tracking-widest">
                {entry.version}
              </span>
              <span className="text-gold-500/40 text-xs select-none">·</span>
              <span className="text-xs font-sans text-navy-700/40">
                {entry.type}
              </span>
            </div>

            <ul className="space-y-1.5">
              {entry.changes.map((change, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span
                    className="text-xs shrink-0 pt-0.5"
                    style={{ color: 'rgba(200,176,112,0.50)' }}
                    aria-hidden="true"
                  >
                    —
                  </span>
                  <span className="text-sm font-sans text-navy-700/70 leading-relaxed">
                    {change}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Build version stamp */}
      <div className="border-t border-slate-100 pt-6 mt-12 max-w-3xl">
        <p className="text-xs font-mono text-navy-700/30">
          ROA v{buildInfo.version}{' '}
          ({buildInfo.gitCommit !== 'unknown' ? buildInfo.gitCommit : 'dev'})
        </p>
      </div>
    </PageContainer>
  )
}
