/**
 * Factory functions for JSON-LD structured data schemas.
 * Returns plain objects compatible with the JsonLd component's `data` prop.
 * All schemas conform to schema.org vocabulary.
 */

export function organizationSchema(siteUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type':    'Organization',
    name:        'Republic of Ambazonia (ROA)',
    url:         siteUrl,
    description:
      'The Republic of Ambazonia (ROA) is the former United Nations Trust Territory of Southern British Cameroons. ' +
      'This platform holds historical documents, legal frameworks, and governance records related to the constitutional continuity argument.',
    email: 'RepublicOfAmbazoniaDao@gmail.com',
  }
}

export function webSiteSchema(siteUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type':    'WebSite',
    name:        'Republic of Ambazonia (ROA)',
    url:         siteUrl,
    description: 'Republic of Ambazonia (ROA) — primary source platform for constitutional history, UN trusteeship records, and governance documentation.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type':      'EntryPoint',
        urlTemplate:  `${siteUrl}/research/inquiry?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function webPageSchema(
  url:         string,
  name:        string,
  description: string,
  siteUrl:     string,
): Record<string, unknown> {
  return {
    '@context':  'https://schema.org',
    '@type':     'WebPage',
    name,
    description,
    url,
    isPartOf: { '@type': 'WebSite', url: siteUrl },
  }
}

export function faqPageSchema(
  url:     string,
  entries: Array<{ question: string; shortAnswer: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    url,
    mainEntity: entries.slice(0, 20).map(e => ({
      '@type': 'Question',
      name:    e.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text:    e.shortAnswer,
      },
    })),
  }
}
