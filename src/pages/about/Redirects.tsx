import { PageContainer, PageHeading } from '../../components/layout/PageContainer'
import { RouteMeta } from '../../components/seo/RouteMeta'
import { siteUrl } from '../../lib/env'
import redirectsData from '../../data/redirects.json'

interface RedirectRule {
  from:   string
  to:     string
  reason: string
  date:   string
  phase:  string
}

const rules = redirectsData.redirects as RedirectRule[]

export default function Redirects() {
  return (
    <PageContainer
      breadcrumbOverrides={[
        { label: 'Home', path: '/' },
        { label: 'Redirects' },
      ]}
    >
      <RouteMeta
        title="Link Redirect Registry — Republic of Ambazonia"
        description="Registry of active client-side redirects maintaining link continuity for corrected or migrated document URLs in the Republic of Ambazonia archive."
        canonical={`${siteUrl}/about/redirects`}
      />

      <PageHeading
        title="Link Redirect Registry"
        subtitle="Active redirects maintaining continuity for corrected or migrated document URLs."
      />

      <div className="max-w-3xl">
        <p className="text-sm font-sans text-navy-700/60 leading-relaxed mb-10">
          When a document URL is corrected or migrated, the legacy path is preserved via a
          client-side redirect. This registry records all active redirects, their authorising
          phase, and the reason for the change.
        </p>

        {rules.length === 0 ? (
          <p className="text-sm font-sans text-navy-700/40 italic">
            No redirects are currently registered.
          </p>
        ) : (
          <div className="space-y-6">
            {rules.map((rule, i) => (
              <section
                key={i}
                className="border border-slate-200 p-6"
                aria-label={`Redirect ${i + 1}`}
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
                  <span className="text-xs font-sans text-navy-700/40 uppercase tracking-widest">
                    {rule.phase}
                  </span>
                  <span className="text-xs font-sans text-navy-700/30 tabular-nums">
                    {rule.date}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-sans text-navy-700/40 uppercase tracking-widest w-12 shrink-0 pt-0.5">
                      From
                    </span>
                    <code className="text-xs font-mono text-navy-700/60 bg-slate-50 px-2 py-1 break-all leading-relaxed">
                      {rule.from}
                    </code>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-sans text-navy-700/40 uppercase tracking-widest w-12 shrink-0 pt-0.5">
                      To
                    </span>
                    <code className="text-xs font-mono text-navy-700/60 bg-slate-50 px-2 py-1 break-all leading-relaxed">
                      {rule.to}
                    </code>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-sm font-sans text-navy-700/65 leading-relaxed">
                    {rule.reason}
                  </p>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
