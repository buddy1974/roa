export interface MetaOptions {
  title:       string
  description: string
  canonical:   string
}

/**
 * Updates document.title, <meta name="description">, and <link rel="canonical">.
 * Creates the elements if they do not already exist in <head>.
 * Safe to call on every route change.
 */
export function setPageMeta({ title, description, canonical }: MetaOptions): void {
  document.title = title

  // description
  let desc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (!desc) {
    desc = document.createElement('meta')
    desc.setAttribute('name', 'description')
    document.head.appendChild(desc)
  }
  desc.setAttribute('content', description)

  // canonical
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', canonical)
}
