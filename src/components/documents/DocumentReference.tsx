import { Link } from 'react-router-dom'
import documentsData from '../../data/documents.json'
import type { Document } from './DocumentCard'

interface Props {
  sectionId: string
}

const allDocuments = documentsData.documents as Document[]

export function DocumentReference({ sectionId }: Props) {
  const docs = allDocuments.filter(doc => doc.relatedSections.includes(sectionId))

  if (docs.length === 0) return null

  return (
    <aside className="mt-8 border-l-2 border-gold-600/40 bg-navy-900/60 pl-5 pr-4 py-4">
      <p className="text-xs font-sans text-gold-500/70 uppercase tracking-widest mb-3">
        Primary Source Documents
      </p>
      <ul className="flex flex-col gap-2">
        {docs.map(doc => (
          <li key={doc.id}>
            <Link
              to={`/documents/${doc.id}`}
              className="group flex items-baseline gap-2"
            >
              <span className="text-gold-600/50 text-xs flex-shrink-0 font-sans select-none">
                ↗
              </span>
              <span className="text-sm font-sans text-parchment-200/70 leading-snug group-hover:text-parchment-100">
                {doc.title}
                {doc.year && (
                  <span className="ml-2 text-xs text-parchment-200/35 tabular-nums">
                    {doc.year}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
