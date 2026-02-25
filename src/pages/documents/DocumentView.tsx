import { useParams } from 'react-router-dom'
import type { Document } from '../../components/documents/DocumentCard'
import { PageContainer, PageHeading } from '../../components/layout/PageContainer'
import { DocumentMeta } from '../../components/documents/DocumentMeta'
import { RouteMeta } from '../../components/seo/RouteMeta'
import { JsonLd } from '../../components/seo/JsonLd'
import { siteUrl } from '../../lib/env'
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
      </PageContainer>
    </>
  )
}
