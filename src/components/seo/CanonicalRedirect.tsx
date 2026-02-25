import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/** Normalises a pathname to its canonical form (lowercase, no double slashes, no trailing slash). */
function toCanonical(pathname: string): string {
  let p = pathname.replace(/\/+/g, '/') // collapse double slashes
  p = p.toLowerCase()
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1) // remove trailing slash except root
  return p
}

/**
 * Renders nothing. On every route change, if the current pathname is not in
 * canonical form, performs a replace-navigation to the canonical path so the
 * non-canonical URL is never added to browser history.
 */
export function CanonicalRedirect() {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const canonical = toCanonical(pathname)
    if (canonical !== pathname) {
      navigate(canonical + search + hash, { replace: true })
    }
  }, [pathname, search, hash, navigate])

  return null
}
