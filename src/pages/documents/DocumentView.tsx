import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import type { Document } from '../../components/documents/DocumentCard'
import { PageContainer, PageHeading } from '../../components/layout/PageContainer'
import { DocumentMeta } from '../../components/documents/DocumentMeta'
import { RouteMeta } from '../../components/seo/RouteMeta'
import { JsonLd } from '../../components/seo/JsonLd'
import { siteUrl } from '../../lib/env'
import { getRelatedDocuments } from '../../lib/related'
import documentsData from '../../data/documents.json'
import Documents from '../Documents'

const ALL_DOCS = documentsData.documents as Document[]

/**
 * Canonical document view at /documents/:slug.
 *
 * Slug resolution:
 *   1. Prefer `doc.id` (filename-derived, stable across builds).
 *   2. If slug matches no document (e.g. category nav like /documents/constitution),
 *      fall back to the main Documents listing — preserving backward compatibility.
 */
export default function DocumentView() {
  const { slug } = useParams<{ slug: string }>()
  const doc: Document | undefined = slug ? ALL_DOCS.find(d => d.id === slug) : undefined

  // Category nav fallback (e.g. /documents/constitution, /documents/proclamations)
  if (!doc) return <Documents />

  const related = getRelatedDocuments(doc.id)

  const canonicalUrl = `${siteUrl}/documents/${doc.id}`

  const docSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type':    'CreativeWork',
    name:       doc.title,
    url:        canonicalUrl,
    ...(doc.year ? { dateCreated: doc.year } : {}),
  }

  const metaDescription =
    `Official document: ${doc.title}. Category: ${doc.category}.` +
    (doc.year ? ` Year: ${doc.year}.` : '') +
    ' Republic of Ambazonia institutional archive.'

  return (
    <>
      <RouteMeta
        title={`${doc.title} — Republic of Ambazonia`}
        description={metaDescription}
        canonical={canonicalUrl}
      />
      <JsonLd id="doc-schema" data={docSchema} />

      <PageContainer
        breadcrumbOverrides={[
          { label: 'Home',      path: '/' },
          { label: 'Documents', path: '/documents' },
          { label: doc.title },
        ]}
      >
        <PageHeading title={doc.title} />

        {/* Embedded PDF viewer */}
        <div
          className="mb-8 border border-slate-200"
          style={{ height: '72vh', minHeight: '400px' }}
        >
          <iframe
            src={doc.file}
            title={doc.title}
            className="w-full h-full"
            style={{ border: 'none' }}
            loading="lazy"
          />
        </div>

        {/* Metadata + citation panel */}
        <DocumentMeta doc={doc} />

        {/* Related documents */}
        {related.length > 0 && (
          <section className="mt-10" aria-labelledby="related-heading">
            <div className="h-px w-10 bg-gold-500 mb-6" />
            <h2
              id="related-heading"
              className="font-serif text-navy-900 text-xl mb-6"
            >
              Related Documents
            </h2>
            <ul className="space-y-3">
              {related.map(r => (
                <li key={r.id} className="border border-slate-200 p-4">
                  <Link
                    to={`/documents/${r.id}`}
                    className="text-sm font-sans text-navy-900 hover:text-gold-600 transition-colors block leading-snug"
                  >
                    {r.title}
                  </Link>
                  <p className="text-xs font-sans text-navy-700/45 mt-1">
                    {r.year ?? '—'} · {r.category}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </PageContainer>
    </>
  )
}
