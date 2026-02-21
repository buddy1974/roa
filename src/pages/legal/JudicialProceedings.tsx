import { PageContainer, PageHeading } from '../../components/layout/PageContainer'
import legalData from '../../data/legal.json'

type Proceeding = (typeof legalData.proceedings)[number]

function SignificanceBar({ significance }: { significance: string }) {
  return (
    <div
      className={`absolute left-0 top-0 bottom-0 w-0.5 ${
        significance === 'primary' ? 'bg-gold-500' : 'bg-navy-700'
      }`}
    />
  )
}

function ProceedingRow({ proceeding }: { proceeding: Proceeding }) {
  return (
    <tr className="border-b border-navy-800 last:border-0 group">
      {/* Case */}
      <td className="relative pl-6 pr-4 py-5 align-top">
        <SignificanceBar significance={proceeding.significance} />
        <p className="text-sm font-sans text-parchment-100 leading-snug">
          {proceeding.case}
        </p>
        {proceeding.parties && (
          <p className="text-xs font-sans text-parchment-200/40 mt-1 leading-snug italic">
            {proceeding.parties}
          </p>
        )}
      </td>

      {/* Year */}
      <td className="px-4 py-5 align-top whitespace-nowrap">
        <span className="text-sm font-sans text-parchment-200/60 tabular-nums">
          {proceeding.year}
        </span>
      </td>

      {/* Jurisdiction */}
      <td className="px-4 py-5 align-top">
        <span className="text-xs font-sans text-gold-500/70 leading-snug">
          {proceeding.jurisdiction}
        </span>
      </td>

      {/* Summary */}
      <td className="pl-4 pr-2 py-5 align-top">
        <p className="text-sm font-sans text-parchment-200/60 leading-relaxed mb-2">
          {proceeding.summary}
        </p>
        {proceeding.outcome && (
          <p className="text-xs font-sans text-parchment-200/35 border-l-2 border-navy-700 pl-3 leading-snug italic">
            {proceeding.outcome}
          </p>
        )}
        {proceeding.tags && proceeding.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {proceeding.tags.map(tag => (
              <span
                key={tag}
                className="text-xs font-sans text-parchment-200/30 bg-navy-800 px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </td>
    </tr>
  )
}

/* Mobile card layout — used below md breakpoint */
function ProceedingCard({ proceeding }: { proceeding: Proceeding }) {
  return (
    <article className="relative bg-navy-900 border border-navy-800 p-5 pl-6">
      <div
        className={`absolute left-0 top-0 bottom-0 w-0.5 ${
          proceeding.significance === 'primary' ? 'bg-gold-500' : 'bg-navy-700'
        }`}
      />

      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-sans text-gold-500/70 leading-snug">
          {proceeding.jurisdiction}
        </span>
        <span className="text-xs font-sans text-parchment-200/40 tabular-nums whitespace-nowrap">
          {proceeding.year}
        </span>
      </div>

      <p className="text-sm font-sans text-parchment-100 leading-snug mb-1">
        {proceeding.case}
      </p>

      {proceeding.parties && (
        <p className="text-xs font-sans text-parchment-200/40 italic mb-3 leading-snug">
          {proceeding.parties}
        </p>
      )}

      <p className="text-sm font-sans text-parchment-200/60 leading-relaxed mb-2">
        {proceeding.summary}
      </p>

      {proceeding.outcome && (
        <p className="text-xs font-sans text-parchment-200/35 border-l-2 border-navy-700 pl-3 leading-snug italic mb-3">
          {proceeding.outcome}
        </p>
      )}

      {proceeding.tags && proceeding.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {proceeding.tags.map(tag => (
            <span
              key={tag}
              className="text-xs font-sans text-parchment-200/30 bg-navy-800 px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

export default function JudicialProceedings() {
  const proceedings = legalData.proceedings

  return (
    <PageContainer>
      <PageHeading
        title="Judicial Proceedings"
        subtitle="International and domestic legal proceedings relevant to the Ambazonian sovereignty claim. Includes advisory opinions, human rights determinations, and tribunal records."
      />

      {/* Record count */}
      <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-8">
        {proceedings.length} proceeding{proceedings.length !== 1 ? 's' : ''}
      </p>

      {/* Table — md and above */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-navy-300">
              <th className="pl-6 pr-4 py-3 text-left text-xs font-sans text-navy-700/50 uppercase tracking-widest font-normal">
                Case
              </th>
              <th className="px-4 py-3 text-left text-xs font-sans text-navy-700/50 uppercase tracking-widest font-normal whitespace-nowrap">
                Year
              </th>
              <th className="px-4 py-3 text-left text-xs font-sans text-navy-700/50 uppercase tracking-widest font-normal">
                Jurisdiction
              </th>
              <th className="pl-4 pr-2 py-3 text-left text-xs font-sans text-navy-700/50 uppercase tracking-widest font-normal">
                Summary &amp; Outcome
              </th>
            </tr>
          </thead>
          <tbody className="bg-navy-900">
            {proceedings.map(p => (
              <ProceedingRow key={p.id} proceeding={p} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — below md */}
      <div className="md:hidden flex flex-col gap-4">
        {proceedings.map(p => (
          <ProceedingCard key={p.id} proceeding={p} />
        ))}
      </div>
    </PageContainer>
  )
}
