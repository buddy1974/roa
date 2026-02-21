import { PageContainer, PageHeading } from '../../components/layout/PageContainer'
import { DocumentReference } from '../../components/documents/DocumentReference'
import historyData from '../../data/history.json'

const eraLabels: Record<string, string> = {
  'pre-colonial': 'Pre-Colonial',
  'colonial':     'Colonial Period',
  'mandate':      'League Mandate',
  'trusteeship':  'UN Trust Territory',
  'federation':   'Federal Period',
  'unitary':      'Unitary State',
  'restoration':  'Restoration Era',
}

export default function Continuity() {
  const sections = historyData.continuity

  return (
    <PageContainer>
      <PageHeading
        title="Continuity of Statehood"
        subtitle="A chronological account of the legal and political history of the Southern Cameroons, from its establishment as a distinct administrative entity through to the contemporary claim of restored sovereignty."
      />

      {/* Section list */}
      <div className="max-w-3xl">
        {sections.map((section, i) => (
          <article
            key={section.id}
            id={section.id}
            className="mb-16 pb-16 border-b border-navy-800 last:border-0 last:mb-0 last:pb-0"
          >
            {/* Section index + era label */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-sans text-navy-700/40 tabular-nums w-5 text-right">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="h-px flex-1 bg-navy-300 max-w-8" />
              <span className="text-xs font-sans text-gold-600 uppercase tracking-widest">
                {eraLabels[section.era] ?? section.era}
              </span>
              <span className="text-xs font-sans text-navy-700/40 uppercase tracking-widest">
                {section.period}
              </span>
            </div>

            {/* Heading with gold accent rule */}
            <div className="mb-5">
              <div className="h-px w-10 bg-gold-500 mb-4" />
              <h2 className="font-serif text-navy-900 text-2xl leading-snug">
                {section.title}
              </h2>
            </div>

            {/* Body */}
            <p className="font-sans text-navy-700/80 text-base leading-relaxed">
              {section.content}
            </p>

            {/* Tags */}
            {section.tags && section.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {section.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs font-sans text-parchment-200/35 bg-navy-800 border border-navy-700 px-2.5 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Primary source documents for this section */}
            <DocumentReference sectionId={section.id} />
          </article>
        ))}
      </div>

      {/* Section index (anchor nav for long-form reading) */}
      <aside className="hidden xl:block fixed top-32 right-8 w-52">
        <p className="text-xs font-sans text-parchment-200/30 uppercase tracking-widest mb-3">
          Sections
        </p>
        <nav className="flex flex-col gap-1">
          {sections.map((section, i) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-xs font-sans text-parchment-200/40 hover:text-gold-400 transition-colors py-0.5 leading-snug"
            >
              <span className="text-parchment-200/20 mr-1.5 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              {section.period}
            </a>
          ))}
        </nav>
      </aside>
    </PageContainer>
  )
}
