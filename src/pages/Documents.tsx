import { useState, useMemo } from 'react'
import { DocumentCard, type Document } from '../components/documents/DocumentCard'
import { DocumentFilter, type FilterState } from '../components/documents/DocumentFilter'
import { DocumentViewer } from '../components/documents/DocumentViewer'
import { PageContainer, PageHeading } from '../components/layout/PageContainer'
import documentsData from '../data/documents.json'

const defaultFilters: FilterState = { category: '' }

const allDocuments = documentsData.documents as Document[]

export default function Documents() {
  const [filters, setFilters]   = useState<FilterState>(defaultFilters)
  const [selected, setSelected] = useState<Document | null>(null)

  /* Derive unique category list from data — sorted alphabetically */
  const categories = useMemo(() => {
    const set = new Set(allDocuments.map(d => d.category))
    return [...set].sort()
  }, [])

  /* Apply filter */
  const filtered = useMemo(() => {
    return allDocuments.filter(doc => {
      if (filters.category && doc.category !== filters.category) return false
      return true
    })
  }, [filters])

  return (
    <PageContainer>
      <PageHeading
        title="Document Archive"
        subtitle="The primary repository of constitutional, governmental, and diplomatic documents of the Federal Republic of Ambazonia."
      />

      {/* Layout: filter sidebar + document grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Sidebar */}
        <aside className="w-full lg:w-56 flex-shrink-0 lg:sticky lg:top-28">
          <DocumentFilter
            filters={filters}
            categories={categories}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />

          {/* Document count */}
          <p className="mt-4 text-xs font-sans text-navy-700/40 uppercase tracking-widest px-1">
            {filtered.length} of {allDocuments.length} document{allDocuments.length !== 1 ? 's' : ''}
          </p>
        </aside>

        {/* Document grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="bg-navy-900 border border-navy-800 px-8 py-16 text-center">
              <p className="font-serif text-parchment-200/40 text-lg mb-2">
                No documents match the selected filter
              </p>
              <button
                onClick={() => setFilters(defaultFilters)}
                className="text-xs text-gold-500/60 hover:text-gold-400 font-sans uppercase tracking-widest transition-colors mt-2"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onClick={setSelected}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal viewer */}
      {selected && (
        <DocumentViewer
          document={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </PageContainer>
  )
}
