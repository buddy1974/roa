/**
 * generate-exports.js
 *
 * Prebuild script — run before tsc and vite build.
 * Produces:
 *   public/exports/roa-checksums.json   docId → sha256
 *   public/exports/roa-index.json       full document index
 *   public/exports/roa-index.csv        same, CSV format
 *   src/data/roa-checksums.json         importable copy for DocumentMeta
 *
 * No external dependencies — Node built-ins only (fs, path, crypto, url).
 */

import fs   from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.join(__dirname, '..')

// ── Source data ───────────────────────────────────────────────────────────────

const { documents } = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'data', 'documents.json'), 'utf8')
)

// ── SHA-256 checksums ─────────────────────────────────────────────────────────

const PDF_DIR   = path.join(ROOT, 'public', 'documents')
const checksums = {}

for (const doc of documents) {
  const filename = doc.file.replace(/^\/documents\//, '')
  const pdfPath  = path.join(PDF_DIR, filename)
  if (fs.existsSync(pdfPath)) {
    const buf = fs.readFileSync(pdfPath)
    checksums[doc.id] = crypto.createHash('sha256').update(buf).digest('hex')
  } else {
    checksums[doc.id] = ''
  }
}

// ── Document number generation (mirrors src/lib/docNumber.ts) ─────────────────
// Group by year (null → '0000'), sort by lowercased title, assign ROA-YYYY-XXXX.

const groups = new Map()
for (const doc of documents) {
  const yearKey = doc.year ?? '0000'
  if (!groups.has(yearKey)) groups.set(yearKey, [])
  groups.get(yearKey).push(doc)
}

const docNumberMap = new Map()
for (const [yearKey, docs] of groups) {
  const sorted = [...docs].sort((a, b) => {
    const ta = a.title.toLowerCase()
    const tb = b.title.toLowerCase()
    return ta < tb ? -1 : ta > tb ? 1 : 0
  })
  sorted.forEach((doc, idx) => {
    docNumberMap.set(doc.id, `ROA-${yearKey}-${String(idx + 1).padStart(4, '0')}`)
  })
}

// ── Canonical URL prefix (from env, empty string if unset) ────────────────────

const siteUrl = (process.env.VITE_SITE_URL ?? '').replace(/\/$/, '')

// ── Build sorted index: year asc, then title asc (locale-independent) ─────────

const sorted = [...documents].sort((a, b) => {
  const ya = a.year ?? '0000'
  const yb = b.year ?? '0000'
  if (ya !== yb) return ya < yb ? -1 : ya > yb ? 1 : 0
  const ta = a.title.toLowerCase()
  const tb = b.title.toLowerCase()
  return ta < tb ? -1 : ta > tb ? 1 : 0
})

const indexEntries = sorted.map(doc => ({
  docNumber:    docNumberMap.get(doc.id) ?? 'ROA-0000-0000',
  id:           doc.id,
  title:        doc.title,
  year:         doc.year ?? '',
  category:     doc.category,
  canonicalUrl: `${siteUrl}/documents/${doc.id}`,
  pdfPath:      doc.file,
  sha256:       checksums[doc.id] ?? '',
}))

// ── Write outputs ─────────────────────────────────────────────────────────────

const EXPORTS_DIR  = path.join(ROOT, 'public', 'exports')
const SRC_DATA_DIR = path.join(ROOT, 'src', 'data')

fs.mkdirSync(EXPORTS_DIR, { recursive: true })

// public/exports/roa-checksums.json
fs.writeFileSync(
  path.join(EXPORTS_DIR, 'roa-checksums.json'),
  JSON.stringify(checksums, null, 2),
)

// public/exports/roa-index.json
fs.writeFileSync(
  path.join(EXPORTS_DIR, 'roa-index.json'),
  JSON.stringify(indexEntries, null, 2),
)

// public/exports/roa-index.csv
const CSV_KEYS = ['docNumber','id','title','year','category','canonicalUrl','pdfPath','sha256']

function csvCell(value) {
  const s = String(value ?? '')
  return (s.includes(',') || s.includes('"') || s.includes('\n'))
    ? '"' + s.replace(/"/g, '""') + '"'
    : s
}

fs.writeFileSync(
  path.join(EXPORTS_DIR, 'roa-index.csv'),
  [CSV_KEYS.join(','), ...indexEntries.map(e => CSV_KEYS.map(k => csvCell(e[k])).join(','))].join('\n'),
)

// src/data/roa-checksums.json — importable by DocumentMeta at Vite build time
fs.writeFileSync(
  path.join(SRC_DATA_DIR, 'roa-checksums.json'),
  JSON.stringify(checksums, null, 2),
)

// ── Summary ───────────────────────────────────────────────────────────────────

const hashed = Object.values(checksums).filter(v => v.length > 0).length
console.log(`✓ generate-exports: ${indexEntries.length} documents, ${hashed} PDFs hashed`)
console.log(`  public/exports/roa-checksums.json`)
console.log(`  public/exports/roa-index.json`)
console.log(`  public/exports/roa-index.csv`)
console.log(`  src/data/roa-checksums.json`)
