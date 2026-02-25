import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import redirectsData from '../../data/redirects.json'

interface RedirectRule {
  from:   string
  to:     string
  reason: string
  date:   string
  phase:  string
}

const RULES = redirectsData.redirects as RedirectRule[]

/**
 * Renders nothing. On every route change, checks whether the current pathname
 * exactly matches a registered redirect rule's "from" path. If so, performs a
 * replace-navigation to the "to" path.
 *
 * Loop prevention: a rule only fires when pathname === rule.from, never when
 * pathname === rule.to. Navigation uses replace so browser history is not
 * polluted with stale entries.
 *
 * Designed to coexist with CanonicalRedirect (normalisation layer). Both
 * components may fire for the same URL if it matches a redirect rule AND
 * requires normalisation; they will converge on the same target.
 */
export function RedirectEngine() {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    for (const rule of RULES) {
      if (pathname === rule.from) {
        navigate(rule.to + search + hash, { replace: true })
        break
      }
    }
  }, [pathname, search, hash, navigate])

  return null
}
