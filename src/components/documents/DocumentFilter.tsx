export interface FilterState {
  category: string
}

interface DocumentFilterProps {
  filters:    FilterState
  categories: string[]
  onChange:   (filters: FilterState) => void
  onReset:    () => void
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

export function DocumentFilter({ filters, categories, onChange, onReset }: DocumentFilterProps) {
  const hasActive = filters.category !== ''

  return (
    <div className="bg-navy-900 border border-navy-800">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-navy-800">
        <span className="text-xs font-sans text-parchment-200/40 uppercase tracking-widest">
          Filter Documents
        </span>
        {hasActive && (
          <button
            onClick={onReset}
            className="text-xs font-sans text-gold-500/70 hover:text-gold-400 uppercase tracking-widest transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category select */}
      <div className="p-5">
        <label className="block text-xs font-sans text-parchment-200/40 uppercase tracking-widest mb-1.5">
          Category
        </label>
        <div className="relative">
          <select
            value={filters.category}
            onChange={e => onChange({ category: e.target.value })}
            className={[
              'w-full bg-navy-950 border text-sm font-sans px-3 py-2.5 pr-8',
              'appearance-none cursor-pointer transition-colors',
              'focus:outline-none',
              filters.category
                ? 'border-gold-600/50 text-parchment-100'
                : 'border-navy-700 text-parchment-200/55 hover:border-navy-600',
            ].join(' ')}
          >
            <option value="">All</option>
            {categories.map(c => (
              <option key={c} value={c}>{categoryLabels[c] ?? c}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-parchment-200/30 text-xs select-none">
            ▾
          </span>
        </div>
      </div>

      {/* Active chip */}
      {hasActive && (
        <div className="px-5 pb-5">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-sans text-gold-400
              bg-gold-500/10 border border-gold-600/25 px-2.5 py-1
              hover:bg-gold-500/20 transition-colors"
          >
            {categoryLabels[filters.category] ?? filters.category}
            <span className="opacity-50">✕</span>
          </button>
        </div>
      )}
    </div>
  )
}
