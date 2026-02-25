/** Resolved site origin from VITE_SITE_URL env var. No trailing slash. */
export const siteUrl: string = ((import.meta.env['VITE_SITE_URL'] ?? '') as string).replace(/\/$/, '')
