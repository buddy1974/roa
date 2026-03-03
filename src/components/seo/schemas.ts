/**
 * Factory functions for JSON-LD structured data schemas.
 * Returns plain objects compatible with the JsonLd component's `data` prop.
 * All schemas conform to schema.org vocabulary.
 */

export function organizationSchema(siteUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type':    'Organization',
    name:        'Republic of Ambazonia Archive',
    url:         siteUrl,
    description:
      'The official digital archive of the Federal Republic of Ambazonia. ' +
      'Historical documents, legal frameworks, and governance records of the sovereignty claim.',
    email: 'RepublicOfAmbazoniaDao@gmail.com',
  }
}

export function webSiteSchema(siteUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type':    'WebSite',
    name:        'Republic of Ambazonia Archive',
    url:         siteUrl,
    description: 'Official digital archive of the Federal Republic of Ambazonia.',
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
