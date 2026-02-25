import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Document } from './DocumentCard'
import { formatCitation, formatAcademicCitation } from '../../lib/citation'
import { copyToClipboard } from '../../lib/clipboard'
import { getDocNumber } from '../../lib/docNumber'
import { classifyDocument } from '../../lib/docClass'
import { Button } from '../ui/Button'

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

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-slate-200 last:border-0">
      <span className="text-xs font-sans text-navy-700/45 uppercase tracking-widest w-32 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm font-sans text-navy-900 flex-1 leading-relaxed">
        {value}
      </span>
    </div>
  )
}

interface Props {
  doc: Document
}

/**
 * Institutional metadata panel for a single document.
 * Renders title, year, category, filename, keywords, citation box, and action buttons.
 * Uses light-background institutional styling — safe to mount on any white/parchment page.
 */
export function DocumentMeta({ doc }: Props) {
  const [copied, setCopied] = useState(false)
  const [copiedAcademic, setCopiedAcademic] = useState(false)

  const docNumber      = getDocNumber(doc.id)
  const citation       = formatCitation(doc)
  const academicCitation = formatAcademicCitation(doc, docNumber)
  const filename       = doc.file.split('/').pop() ?? doc.file
  const catLabel       = categoryLabels[doc.category] ?? doc.category
  const { type: docType, status: docStatus } = classifyDocument(doc.category)

  async function handleCopy() {
    const ok = await copyToClipboard(citation)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleCopyAcademic() {
    const ok = await copyToClipboard(academicCitation)
    if (ok) {
      setCopiedAcademic(true)
      setTimeout(() => setCopiedAcademic(false), 2000)
    }
  }

  return (
    <section aria-label="Document metadata">
      <div className="h-px w-10 bg-gold-500 mb-6" />
      <h2 className="font-serif text-navy-900 text-xl mb-6">Document Metadata</h2>

      {/* Metadata table */}
      <div className="border border-slate-200 mb-6">
        <MetaRow
          label="Document No."
          value={<code className="text-xs font-mono text-navy-700/60">{docNumber}</code>}
        />
        <MetaRow
          label="Document ID"
          value={<code className="text-xs font-mono text-navy-700/60 break-all">{doc.id}</code>}
        />
        <MetaRow label="Category" value={catLabel} />
        <MetaRow label="Type"     value={docType} />
        <MetaRow label="Status"   value={docStatus} />
        {doc.year && <MetaRow label="Year" value={doc.year} />}
        <MetaRow
          label="Filename"
          value={<span className="font-mono text-xs text-navy-700/60 break-all">{filename}</span>}
        />
        {doc.relatedSections.length > 0 && (
          <MetaRow
            label="Keywords"
            value={
              <div className="flex flex-wrap gap-1.5">
                {doc.relatedSections.map(s => (
                  <span
                    key={s}
                    className="text-xs font-sans px-2 py-0.5 bg-slate-100 text-navy-700/60"
                  >
                    {s}
                  </span>
                ))}
              </div>
            }
          />
        )}
      </div>

      {/* Institutional citation box */}
      <div className="mb-4">
        <p className="text-xs font-sans text-navy-700/45 uppercase tracking-widest mb-2">
          Cite this document — Institutional
        </p>
        <div className="border border-slate-200 bg-parchment-50 px-4 py-3">
          <p className="text-xs font-mono text-navy-700/65 leading-relaxed break-all select-all">
            {citation}
          </p>
        </div>
      </div>

      {/* Academic citation box */}
      <div className="mb-5">
        <p className="text-xs font-sans text-navy-700/45 uppercase tracking-widest mb-2">
          Cite this document — Academic
        </p>
        <div className="border border-slate-200 bg-parchment-50 px-4 py-3">
          <p className="text-xs font-mono text-navy-700/65 leading-relaxed break-all select-all">
            {academicCitation}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" size="sm" onClick={() => { void handleCopy() }}>
          {copied ? 'Copied!' : 'Copy Citation'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => { void handleCopyAcademic() }}>
          {copiedAcademic ? 'Copied!' : 'Copy Academic Citation'}
        </Button>
        <a href={doc.file} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">Download PDF</Button>
        </a>
        <Link
          to="/documents"
          className="text-xs font-sans uppercase tracking-wide transition-colors"
          style={{ color: 'rgba(0,36,72,0.50)' }}
        >
          ← Back to Archive
        </Link>
      </div>
    </section>
  )
}
