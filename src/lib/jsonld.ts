/**
 * Upserts a <script type="application/ld+json"> element in <head>.
 * The element is keyed by `id` so it can be updated without duplication.
 * `content` must be a pre-serialised JSON string.
 */
export function setJsonLd(id: string, content: string): void {
  let script = document.getElementById(id) as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    document.head.appendChild(script)
  }
  script.textContent = content
}

/** Removes the JSON-LD script with the given id from <head>. */
export function removeJsonLd(id: string): void {
  document.getElementById(id)?.remove()
}
