import { Button } from '../ui/Button'
import type { Document } from './DocumentCard'

interface DocumentViewerProps {
  document: Document
  onClose:  () => void
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

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-navy-800 last:border-0">
      <span className="text-xs text-parchment-200/35 font-sans uppercase tracking-widest w-28 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-parchment-100 font-sans flex-1 leading-relaxed">
        {value}
      </span>
    </div>
  )
}

export function DocumentViewer({ document: doc, onClose }: DocumentViewerProps) {
  const filename = doc.file.split('/').pop() ?? doc.file
  const catLabel = categoryLabels[doc.category] ?? doc.category

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-navy-900 border border-navy-700 shadow-2xl shadow-navy-950"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-navy-900 border-b border-navy-800 px-6 py-4 flex items-center justify-between gap-4">
          <span className="text-xs font-sans text-gold-500/70 uppercase tracking-widest">
            {catLabel}
          </span>
          <button
            onClick={onClose}
            className="text-sm text-parchment-200/40 hover:text-parchment-100 transition-colors leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Title block */}
        <div className="px-6 py-8 border-b border-navy-800">
          <div className="h-px w-10 bg-gold-500 mb-5" />
          <h1 className="font-serif text-parchment-50 text-xl leading-tight mb-2">
            {doc.title}
          </h1>
          {doc.year && (
            <p className="text-xs text-parchment-200/40 font-sans uppercase tracking-widest">
              {catLabel} · {doc.year}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="px-6 py-6 border-b border-navy-800">
          <p className="text-xs text-gold-500/70 font-sans uppercase tracking-widest mb-4">
            Document Metadata
          </p>
          <MetaRow label="Document ID" value={<code className="text-xs font-mono text-parchment-200/50">{doc.id}</code>} />
          <MetaRow label="Category"    value={catLabel} />
          {doc.year && <MetaRow label="Year"        value={doc.year} />}
          <MetaRow label="File"        value={<span className="font-mono text-xs text-parchment-200/50 break-all">{filename}</span>} />
        </div>

        {/* Actions */}
        <div className="px-6 py-5 flex items-center gap-3">
          <a
            href={doc.file}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="primary" size="sm">Download PDF</Button>
          </a>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
