import type { Document } from '../components/documents/DocumentCard'
import { siteUrl } from './env'

/**
 * Produces a single-line deterministic citation for an institutional document.
 *
 * Format:
 *   {Title} — {Year} — {Category} — Document ID: {id} — Canonical: {url} — Accessed: {YYYY-MM-DD}
 *
 * Year and Category are omitted when absent.
 * accessedDate defaults to the current local date (YYYY-MM-DD).
 */
export function formatCitation(doc: Document, accessedDate?: string): string {
  const date = accessedDate ?? new Date().toISOString().slice(0, 10)
  const canonicalUrl = `${siteUrl}/documents/${doc.id}`

  const parts: string[] = [doc.title]
  if (doc.year)     parts.push(doc.year)
  if (doc.category) parts.push(doc.category)
  parts.push(`Document ID: ${doc.id}`)
  parts.push(`Canonical: ${canonicalUrl}`)
  parts.push(`Accessed: ${date}`)

  return parts.join(' — ')
}

/**
 * Produces an academic-style citation for an institutional document.
 *
 * Format:
 *   Republic of Ambazonia. "{Title}." {Year}. Document No. {docNumber}. {canonicalUrl}. Accessed {YYYY-MM-DD}.
 *
 * Year is omitted when absent (null).
 * docNumber must be supplied by the caller (use getDocNumber from lib/docNumber).
 * accessedDate defaults to the current local date (YYYY-MM-DD).
 */
export function formatAcademicCitation(
  doc: Document,
  docNumber: string,
  accessedDate?: string,
): string {
  const date = accessedDate ?? new Date().toISOString().slice(0, 10)
  const canonicalUrl = `${siteUrl}/documents/${doc.id}`

  let citation = `Republic of Ambazonia. "${doc.title}."`
  if (doc.year) citation += ` ${doc.year}.`
  citation += ` Document No. ${docNumber}.`
  citation += ` ${canonicalUrl}.`
  citation += ` Accessed ${date}.`

  return citation
}
