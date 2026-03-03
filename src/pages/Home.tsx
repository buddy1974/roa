import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { RouteMeta } from '../components/seo/RouteMeta'
import { JsonLd } from '../components/seo/JsonLd'
import { organizationSchema, webSiteSchema, webPageSchema } from '../components/seo/schemas'
import { siteUrl } from '../lib/env'
import documentsData from '../data/documents.json'

const HOME_ORG_SCHEMA     = organizationSchema(siteUrl)
const HOME_WEBSITE_SCHEMA = webSiteSchema(siteUrl)
const HOME_WEBPAGE_SCHEMA = webPageSchema(
  `${siteUrl}/`,
  'Republic of Ambazonia — Official Digital Archive',
  'The official digital archive of the Federal Republic of Ambazonia. Historical documents, legal frameworks, and governance records of the sovereignty claim.',
  siteUrl,
)

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

const foundations = [
  {
    number:   '01',
    category: 'International Law',
    title:    '1946 UN Trusteeship Agreement',
    body:
      'Southern British Cameroons was placed under United Nations trusteeship in 1946 pursuant to ' +
      'Article 77 of the UN Charter. This agreement created defined international obligations regarding ' +
      'the territory\'s eventual self-determination, distinct from those governing the separately ' +
      'administered French Cameroun.',
  },
  {
    number:   '02',
    category: 'UN Administration',
    title:    'Two Legally Distinct Trust Territories',
    body:
      'Southern British Cameroons and the French-administered Cameroun were constituted as separate ' +
      'UN Trust Territories under separate trusteeship agreements with distinct administrative, legal, ' +
      'and institutional frameworks. The UN Trusteeship Council maintained independent records for each territory.',
  },
  {
    number:   '03',
    category: 'Self-Determination',
    title:    '1961 Plebiscite: Mandate and Implementation',
    body:
      'The February 1961 plebiscite was conducted under UN General Assembly Resolution 1608 (XV). ' +
      'The constitutional continuity argument holds that the union mandate required a negotiated federal ' +
      'arrangement, and that the subsequent unitary state structure departed from the terms under which ' +
      'the plebiscite was administered.',
  },
  {
    number:   '04',
    category: 'Treaty Law',
    title:    'Article 102 UN Charter Registration',
    body:
      'Article 102 of the UN Charter requires that every treaty concluded by a UN member state be ' +
      'registered with the Secretariat. The constitutional continuity argument notes the absence of a ' +
      'registered, negotiated agreement governing the specific constitutional terms of the 1961 union.',
  },
  {
    number:   '05',
    category: 'Boundary Law',
    title:    'Bakassi: Scope of the 2002 ICJ Judgment',
    body:
      'The 2002 International Court of Justice judgment in Cameroon v. Nigeria addressed bilateral ' +
      'boundary delimitation under the 1906 and 1931 Anglo-German agreements. The constitutional ' +
      'continuity argument holds that this ruling did not adjudicate the internal constitutional ' +
      'status of the former Southern British Cameroons territory.',
  },
  {
    number:   '06',
    category: 'African Union',
    title:    'AU Constitutive Act Art. 4(b) — Border Integrity',
    body:
      'Article 4(b) of the African Union Constitutive Act establishes respect for borders existing ' +
      'at the time of independence as a foundational principle. The constitutional continuity argument ' +
      'references the borders of Southern British Cameroons as they existed at the date of the 1961 ' +
      'plebiscite, as distinct from post-independence boundary modifications.',
  },
]

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
      <RouteMeta
        title="Republic of Ambazonia — Official Digital Archive"
        description="The official digital archive of the Federal Republic of Ambazonia. Historical documents, legal frameworks, and governance records of the sovereignty claim."
        canonical={`${siteUrl}/`}
      />
      <JsonLd id="jsonld-organization" data={HOME_ORG_SCHEMA} />
      <JsonLd id="jsonld-website"      data={HOME_WEBSITE_SCHEMA} />
      <JsonLd id="jsonld-webpage-home" data={HOME_WEBPAGE_SCHEMA} />

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
              A primary source repository documenting the constitutional history,
              international trusteeship record, and legal foundations of Southern
              British Cameroons (today Republic of Ambazonia).
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

      {/* ── Foundations of Constitutional Continuity ─────── */}
      <section className="bg-parchment-50 border-b border-parchment-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-12">
            <p className="text-xs font-sans uppercase tracking-widest mb-3" style={{ color: '#C8B070' }}>
              Institutional Reference
            </p>
            <h2 className="font-serif text-navy-900 text-2xl mb-3">
              Foundations of Constitutional Continuity
            </h2>
            <div className="h-px w-10 bg-gold-500 mb-5" />
            <p className="text-sm font-sans text-navy-700/60 leading-relaxed max-w-2xl">
              The constitutional continuity argument rests on a documented sequence of international
              law instruments and UN proceedings. The following foundations are recorded in the primary
              sources held in this archive.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-parchment-200/60">
            {foundations.map(f => (
              <div key={f.number} className="bg-parchment-50 px-6 py-8 border-t-2 border-t-navy-600/20 hover:border-t-navy-600 hover:bg-white transition-colors">
                <p className="text-xs font-sans uppercase tracking-widest mb-4" style={{ color: '#C8B070' }}>
                  {f.number} — {f.category}
                </p>
                <h3 className="font-serif text-navy-900 text-base leading-snug mb-3">
                  {f.title}
                </h3>
                <p className="text-sm font-sans text-navy-700/60 leading-relaxed">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent documents ─────────────────────────────── */}
      <section className="bg-white border-b border-parchment-200">
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
