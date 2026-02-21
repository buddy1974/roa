import { useState } from 'react'
import { PageContainer, PageHeading } from '../../components/layout/PageContainer'
import figuresData from '../../data/figures.json'

type Figure = (typeof figuresData.figures)[number]

const eraLabels: Record<string, string> = {
  'pre-colonial': 'Pre-Colonial',
  'colonial':     'Colonial',
  'mandate':      'League Mandate',
  'trusteeship':  'Trusteeship',
  'federation':   'Federal Period',
  'unitary':      'Unitary State',
  'restoration':  'Restoration',
}

const categoryLabels: Record<string, string> = {
  political: 'Political',
  legal:     'Legal',
  civil:     'Civil Society',
  military:  'Military',
  diplomatic:'Diplomatic',
}

type CategoryFilter = string

function FigureCard({ figure }: { figure: Figure }) {
  return (
    <article className="bg-navy-900 border border-navy-800 hover:border-navy-700 transition-colors duration-200 flex flex-col">
      {/* Significance indicator */}
      <div className={`h-px ${figure.significance === 'primary' ? 'bg-gold-500' : 'bg-navy-700'}`} />

      <div className="p-6 flex flex-col flex-1">
        {/* Category + era */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-sans text-gold-500/60 uppercase tracking-widest">
            {categoryLabels[figure.category] ?? figure.category}
          </span>
          <span className="text-navy-700 select-none">·</span>
          <span className="text-xs font-sans text-parchment-200/30 uppercase tracking-widest">
            {figure.era.map(e => eraLabels[e] ?? e).join(', ')}
          </span>
        </div>

        {/* Name */}
        <h2 className="font-serif text-parchment-50 text-lg leading-tight mb-1">
          {figure.name}
        </h2>

        {/* Title */}
        <p className="text-xs font-sans text-gold-400/70 mb-3 leading-snug">
          {figure.title}
        </p>

        {/* Role */}
        <p className="text-sm font-sans text-parchment-200/55 italic leading-relaxed mb-4">
          {figure.role}
        </p>

        {/* Bio */}
        <p className="text-sm font-sans text-parchment-200/60 leading-relaxed flex-1">
          {figure.bio}
        </p>

        {/* Tags */}
        {figure.tags && figure.tags.length > 0 && (
          <div className="mt-5 pt-4 border-t border-navy-800 flex flex-wrap gap-1.5">
            {figure.tags.map(tag => (
              <span
                key={tag}
                className="text-xs font-sans text-parchment-200/30 bg-navy-800 px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default function Figures() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')

  const categories: CategoryFilter[] = [
    'all',
    ...Array.from(new Set(figuresData.figures.map(f => f.category))).sort(),
  ]

  const filtered = activeCategory === 'all'
    ? figuresData.figures
    : figuresData.figures.filter(f => f.category === activeCategory)

  /* Primary figures first, then secondary */
  const sorted = [...filtered].sort((a, b) => {
    if (a.significance === b.significance) return 0
    return a.significance === 'primary' ? -1 : 1
  })

  return (
    <PageContainer>
      <PageHeading
        title="Key Figures"
        subtitle="Political leaders, legal advocates, and civil society representatives whose roles defined the trajectory of the Southern Cameroons from the trusteeship period through the declaration of independence."
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={[
              'text-xs font-sans uppercase tracking-widest px-3 py-1.5 border transition-colors',
              activeCategory === cat
                ? 'border-gold-500/60 text-gold-500 bg-gold-500/10'
                : 'border-navy-300 text-navy-700/50 hover:border-navy-500 hover:text-navy-700',
            ].join(' ')}
          >
            {cat === 'all' ? 'All' : categoryLabels[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-xs font-sans text-navy-700/40 uppercase tracking-widest mb-6">
        {sorted.length} figure{sorted.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map(figure => (
          <FigureCard key={figure.id} figure={figure} />
        ))}
      </div>
    </PageContainer>
  )
}
