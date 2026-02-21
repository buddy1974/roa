import { Link, useLocation } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbProps {
  overrides?: BreadcrumbItem[]
}

const routeLabels: Record<string, string> = {
  governance:       'Governance',
  documents:        'Documents',
  history:          'History',
  legal:            'Legal',
  tourism:          'Territory',
  executive:        'Executive',
  legislative:      'Legislative',
  judiciary:        'Judiciary',
  decrees:          'Decrees & Orders',
  constitution:     'Constitution',
  proclamations:    'Proclamations',
  treaties:         'Treaties',
  'un-submissions': 'UN Submissions',
  continuity:       'Continuity of Statehood',
  timeline:         'Timeline',
  figures:          'Key Figures',
  proceedings:      'Judicial Proceedings',
  archive:          'Archive',
}

export function Breadcrumb({ overrides }: BreadcrumbProps) {
  const { pathname } = useLocation()

  const crumbs: BreadcrumbItem[] = overrides ?? (() => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return []

    const items: BreadcrumbItem[] = [{ label: 'Home', path: '/' }]
    let accumulated = ''
    segments.forEach((seg, i) => {
      accumulated += `/${seg}`
      items.push({
        label: routeLabels[seg] ?? seg,
        path: i < segments.length - 1 ? accumulated : undefined,
      })
    })
    return items
  })()

  if (crumbs.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-8">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-gold-600/40 text-xs select-none" aria-hidden="true">›</span>
          )}
          {crumb.path ? (
            <Link
              to={crumb.path}
              className="text-xs font-sans text-parchment-200/40 hover:text-gold-500 uppercase tracking-widest transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-xs font-sans text-gold-500/80 uppercase tracking-widest">
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
