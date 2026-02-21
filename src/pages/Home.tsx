import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import documentsData from '../data/documents.json'

const pillars = [
  {
    title: 'Governance',
    description: 'Access executive decrees, legislative acts, and judicial records of the Interim Government.',
    path: '/governance',
    label: 'Institutional',
  },
  {
    title: 'Documents',
    description: 'The primary document archive — constitutions, proclamations, treaties, and UN submissions.',
    path: '/documents',
    label: 'Archive',
  },
  {
    title: 'History',
    description: 'A chronological record of the path to sovereignty from the colonial era to present day.',
    path: '/history',
    label: 'Historical',
  },
  {
    title: 'Territory',
    description: 'Geographical, cultural, and natural resource knowledge of the Ambazonian homeland.',
    path: '/tourism',
    label: 'Territory',
  },
]

const slideshowImages = [
  '/images/slideshow/1.jpg',
  '/images/slideshow/2.jpg',
  '/images/slideshow/3.jpg',
]

const recentDocs = documentsData.documents.slice(0, 3)

/** Inline SVG seal — purely decorative watermark */
function SealWatermark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] opacity-[0.06] pointer-events-none select-none"
      fill="none"
      stroke="#C8B070"
      strokeWidth="0.8"
    >
      <circle cx="100" cy="100" r="96" />
      <circle cx="100" cy="100" r="86" />
      <circle cx="100" cy="100" r="74" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        const x1 = 100 + 74 * Math.cos(angle)
        const y1 = 100 + 74 * Math.sin(angle)
        const x2 = 100 + 86 * Math.cos(angle)
        const y2 = 100 + 86 * Math.sin(angle)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const a1 = ((i * 45 - 90) * Math.PI) / 180
        const a2 = (((i * 45 + 22.5) - 90) * Math.PI) / 180
        const outer = 28
        const inner = 12
        const x1 = 100 + outer * Math.cos(a1)
        const y1 = 100 + outer * Math.sin(a1)
        const x2 = 100 + inner * Math.cos(a2)
        const y2 = 100 + inner * Math.sin(a2)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      })}
      <circle cx="100" cy="100" r="8" />
      <circle cx="100" cy="100" r="3" fill="#C8B070" stroke="none" />
    </svg>
  )
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slideshowImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      {/* ── Hero Slideshow ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-950" style={{ minHeight: '560px' }}>

        {/* Slideshow image layers */}
        {slideshowImages.map((src, i) => (
          <div
            key={i}
            aria-hidden="true"
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              style={{ opacity: 0.4 }}
            />
          </div>
        ))}

        {/* Dark overlay for text legibility — exact emblem dark */}
        <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 16, 32, 0.75)' }} />

        {/* Seal watermark */}
        <SealWatermark />

        {/* Hero text content */}
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-36">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="block h-px w-8" style={{ backgroundColor: '#C8B070', opacity: 0.7 }} />
              <span className="text-xs font-sans tracking-widest uppercase" style={{ color: '#C8B070' }}>
                Federal Republic of Ambazonia
              </span>
            </div>

            <h1 className="font-serif text-parchment-50 text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] mb-8">
              Official Digital Archive
              <br />
              <span style={{ color: '#C8B070' }}>of the Republic of Ambazonia</span>
            </h1>

            <p className="text-parchment-200/60 text-base font-sans leading-loose mb-10 max-w-[60ch]">
              Documenting historical continuity, legal foundations, and constitutional
              development.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/documents">
                <Button variant="primary" size="lg">Browse Documents</Button>
              </Link>
              <Link to="/governance">
                <Button variant="outline" size="lg">Governance</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slideshowImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-8' : 'w-1.5'
              }`}
            style={{ backgroundColor: i === currentSlide ? '#C8B070' : 'rgba(221,208,187,0.35)' }}
            />
          ))}
        </div>
      </section>

      {/* ── Platform sections ────────────────────────────── */}
      <section className="bg-white border-b border-parchment-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-10">
            <h2 className="font-serif text-navy-900 text-2xl mb-3">Platform Sections</h2>
            <div className="h-px w-10 bg-gold-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-parchment-200/60">
            {pillars.map((pillar) => (
              <Link key={pillar.path} to={pillar.path} className="group">
                <div className="bg-white h-full px-6 py-8 hover:bg-parchment-50 transition-colors duration-200 border-t-2 border-t-navy-600/25 group-hover:border-t-navy-600">
                  <p className="text-xs font-sans uppercase tracking-widest mb-4" style={{ color: '#C8B070' }}>
                    {pillar.label}
                  </p>
                  <h3 className="font-serif text-navy-900 text-xl mb-3 group-hover:text-navy-600 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-navy-700/60 font-sans leading-relaxed mb-6">
                    {pillar.description}
                  </p>
                  <span className="text-xs font-sans uppercase tracking-widest transition-colors" style={{ color: '#C8B070', opacity: 0.8 }}>
                    Access →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent documents ─────────────────────────────── */}
      <section className="bg-parchment-50 border-b border-parchment-200">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-serif text-navy-900 text-2xl mb-3">Recent Documents</h2>
              <div className="h-px w-10 bg-gold-500" />
            </div>
            <Link to="/documents" className="text-xs font-sans uppercase tracking-widest transition-colors" style={{ color: '#C8B070', opacity: 0.8 }}>
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentDocs.map(doc => (
              <div key={doc.id} className="bg-white border border-parchment-200 border-t-2 border-t-navy-600/30 p-6 hover:border-t-navy-600 transition-colors">
                <div className="h-px w-8 bg-gold-500 mb-5" />
                <p className="text-xs text-navy-700/50 font-sans uppercase tracking-widest mb-2">
                  {doc.category}
                </p>
                <h3 className="font-serif text-navy-900 text-base leading-snug mb-4">
                  {doc.title}
                </h3>
                <p className="text-xs text-navy-700/40 font-sans">
                  {doc.year ?? '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <section className="bg-navy-900 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: `${documentsData.documents.length}`, label: 'Documents Archived' },
            { value: '4',    label: 'Historical Eras' },
            { value: '2',    label: 'Languages' },
            { value: '2017', label: 'Year of Proclamation' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="font-serif text-gold-400 text-3xl mb-2 leading-none">{stat.value}</div>
              <div className="text-xs text-parchment-200/45 font-sans uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
