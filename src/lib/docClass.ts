export interface DocClassification {
  type:   string
  status: string
}

const TYPE_MAP: Record<string, string> = {
  constitutional: 'Constitutional Instrument',
  ordinance:      'Legislative Ordinance',
  proclamation:   'State Proclamation',
  international:  'International Agreement',
  un:             'United Nations Submission',
  judicial:       'Judicial Record',
  legal:          'Legal Instrument',
  historical:     'Historical Record',
}

const STATUS_MAP: Record<string, string> = {
  constitutional: 'Ratified',
  ordinance:      'Enacted',
  proclamation:   'Issued',
  international:  'On Record',
  un:             'Filed',
  judicial:       'On Record',
  legal:          'On Record',
  historical:     'Archived',
}

/**
 * Derives document type and status from the category field.
 * Both values are deterministic — no runtime state, no randomness.
 */
export function classifyDocument(category: string): DocClassification {
  return {
    type:   TYPE_MAP[category]   ?? 'Document',
    status: STATUS_MAP[category] ?? 'Archived',
  }
}
