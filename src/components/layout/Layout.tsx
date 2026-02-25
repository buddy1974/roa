import { Outlet } from 'react-router-dom'
import { Header }            from './Header'
import { Footer }            from './Footer'
import { CanonicalRedirect } from '../seo/CanonicalRedirect'
import { JsonLd }            from '../seo/JsonLd'
import { siteUrl }           from '../../lib/env'

/** Stable module-level constant — avoids re-serialisation on every render. */
const siteSchema: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id':   `${siteUrl}#org`,
      name:    'Republic of Ambazonia',
      url:     siteUrl || undefined,
    },
    {
      '@type':              'GovernmentOrganization',
      '@id':                `${siteUrl}#govorg`,
      name:                 'Federal Republic of Ambazonia',
      url:                  siteUrl || undefined,
      parentOrganization:   { '@id': `${siteUrl}#org` },
    },
  ],
}

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-navy-900">
      {/* SEO — render-null components; no DOM output */}
      <CanonicalRedirect />
      <JsonLd id="site-schema" data={siteSchema} />

      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
