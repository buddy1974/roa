/**
 * EnvWarning
 *
 * Renders a small warning banner when the build is a production bundle
 * but VITE_SITE_URL has not been set. This signals that canonical URLs,
 * JSON-LD, and citation exports will contain empty-string origins.
 *
 * Rendered only on /about/authority and /about/changelog — not globally.
 * In development (import.meta.env.DEV) this component is always silent.
 */
export function EnvWarning() {
  if (!import.meta.env.PROD) return null
  if (import.meta.env['VITE_SITE_URL']) return null

  return (
    <div
      role="alert"
      className="border border-gold-500/50 bg-gold-500/5 px-4 py-3 mb-8 text-sm font-sans text-navy-700/80 leading-relaxed"
    >
      <span className="font-semibold text-navy-700">Configuration notice:</span>{' '}
      <code className="font-mono text-xs bg-slate-100 px-1 py-0.5">VITE_SITE_URL</code>{' '}
      is not set in this deployment. Canonical URLs, citation exports, and JSON-LD
      structured data will use an empty origin. Set this environment variable before
      publishing to production.
    </div>
  )
}
