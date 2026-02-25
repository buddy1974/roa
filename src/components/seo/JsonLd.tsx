import { useEffect } from 'react'
import { setJsonLd, removeJsonLd } from '../../lib/jsonld'

interface JsonLdProps {
  /** Stable id used to key the <script> element — prevents duplication. */
  id:   string
  /** Plain object to serialise as JSON-LD. Should be reference-stable or useMemo'd by caller. */
  data: Record<string, unknown>
}

/**
 * Renders nothing. Upserts a <script type="application/ld+json"> element in <head>
 * on mount and whenever id/data change. Removes it on unmount.
 * Data is serialised via JSON.stringify; a new string is only produced when
 * the object's content changes, preventing unnecessary DOM writes.
 */
export function JsonLd({ id, data }: JsonLdProps) {
  const serialized = JSON.stringify(data)

  useEffect(() => {
    setJsonLd(id, serialized)
    return () => removeJsonLd(id)
  }, [id, serialized])

  return null
}
