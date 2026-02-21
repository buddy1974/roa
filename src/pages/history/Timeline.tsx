import { PageContainer, PageHeading } from '../../components/layout/PageContainer'
import timelineData from '../../data/timeline.json'
import documentsData from '../../data/documents.json'
import { type Document } from '../../components/documents/DocumentCard'

const allDocuments = documentsData.documents as Document[]

function getDoc(id: string): Document | undefined {
  return allDocuments.find(d => d.id === id)
}

export default function Timeline() {
  return (
    <PageContainer breadcrumbOverrides={[
      { label: 'History', path: '/history' },
      { label: 'Historical Timeline' },
    ]}>
      <PageHeading
        title="Historical Timeline"
        subtitle="A chronological record of the constitutional and political history of Southern Cameroons and the Republic of Ambazonia."
      />

      {/* Timeline */}
      <div className="relative">

        {/* Vertical gold rule */}
        <div className="absolute left-32 top-0 bottom-0 w-px bg-gold-600/25" aria-hidden="true" />

        <ol className="space-y-0">
          {timelineData.events.map((event, index) => {
            const relatedDocuments = event.relatedDocs
              .map(id => getDoc(id))
              .filter((d): d is Document => d !== undefined)

            const isLast = index === timelineData.events.length - 1

            return (
              <li key={event.year} className={`relative flex gap-0 ${isLast ? '' : 'pb-12'}`}>

                {/* Year column */}
                <div className="w-32 flex-shrink-0 pt-1 pr-8 text-right">
                  <span className="font-serif text-2xl font-bold text-gold-500/80 tabular-nums leading-none">
                    {event.year}
                  </span>
                </div>

                {/* Node on the line */}
                <div className="relative flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-gold-600 border border-gold-400/60 mt-1.5 -ml-[5px]" />
                </div>

                {/* Content */}
                <div className="pl-8 flex-1 min-w-0">
                  <h2 className="font-serif text-navy-900 text-xl mb-2 leading-snug">
                    {event.title}
                  </h2>
                  <p className="font-sans text-navy-700/70 text-sm leading-relaxed max-w-2xl">
                    {event.description}
                  </p>

                  {/* Related primary documents */}
                  {relatedDocuments.length > 0 && (
                    <div className="mt-4 border-l border-gold-500/30 pl-4">
                      <p className="text-xs font-sans text-gold-600 uppercase tracking-widest mb-2">
                        Related Primary Documents
                      </p>
                      <ul className="space-y-1">
                        {relatedDocuments.map(doc => (
                          <li key={doc.id}>
                            <a
                              href={doc.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-sans text-navy-700/65 hover:text-gold-500 transition-colors duration-150 inline-flex items-baseline gap-1.5"
                            >
                              <span className="text-gold-600/70 text-xs flex-shrink-0">↗</span>
                              {doc.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </li>
            )
          })}
        </ol>
      </div>
    </PageContainer>
  )
}
