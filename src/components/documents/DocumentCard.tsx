import { Card, CardBody, CardFooter } from '../ui/Card'

export interface Document {
  id:             string
  title:          string
  file:           string
  year:           string | null
  category:       string
  relatedSections: string[]
}

interface DocumentCardProps {
  document: Document
  onClick?: (doc: Document) => void
}

const categoryLabels: Record<string, string> = {
  constitutional: 'Constitutional',
  ordinance:      'Ordinance',
  proclamation:   'Proclamation',
  international:  'International',
  un:             'United Nations',
  judicial:       'Judicial',
  legal:          'Legal',
  historical:     'Historical',
}

export function DocumentCard({ document: doc, onClick }: DocumentCardProps) {
  return (
    <Card
      variant="bordered"
      onClick={onClick ? () => onClick(doc) : undefined}
      className="group hover:border-gold-600/40 transition-colors duration-200"
    >
      {/* Category accent line */}
      <div className={`h-px ${doc.category === 'constitutional' || doc.category === 'proclamation' ? 'bg-gold-500' : 'bg-navy-700'}`} />

      <CardBody>
        {/* Category label */}
        <div className="mb-4">
          <span className="text-xs font-sans text-gold-500/60 uppercase tracking-widest">
            {categoryLabels[doc.category] ?? doc.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-parchment-100 text-base leading-snug mb-4 group-hover:text-gold-400 transition-colors">
          {doc.title}
        </h3>
      </CardBody>

      <CardFooter className="flex items-center justify-between">
        <span className="text-xs text-parchment-200/35 font-sans tabular-nums">
          {doc.year ?? '—'}
        </span>
        <span className="text-xs text-gold-500/50 font-sans uppercase tracking-widest group-hover:text-gold-400 transition-colors">
          View →
        </span>
      </CardFooter>
    </Card>
  )
}
