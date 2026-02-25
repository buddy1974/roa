import { useEffect } from 'react'
import { setPageMeta } from '../../lib/meta'

interface RouteMetaProps {
  title:       string
  description: string
  canonical:   string
}

/**
 * Renders nothing. Imperatively updates <title>, <meta name="description">,
 * and <link rel="canonical"> whenever its props change (i.e. on route change).
 * No dependencies beyond the stdlib. Does not require react-helmet.
 */
export function RouteMeta({ title, description, canonical }: RouteMetaProps) {
  useEffect(() => {
    setPageMeta({ title, description, canonical })
  }, [title, description, canonical])

  return null
}
