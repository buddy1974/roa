import { Badge } from '../components/ui/Badge'
import { PageContainer, PageHeading } from '../components/layout/PageContainer'
import taxonomyData from '../data/taxonomy.json'

const timeline = [
  {
    era: 'colonial',
    year: '1884',
    title: 'German Colonisation of Kamerun',
    body: 'The territory now known as Ambazonia comes under German colonial rule following the Treaty of Protection signed with Douala chiefs. The Southern Cameroons is administered as part of German Kamerun.',
  },
  {
    era: 'colonial',
    year: '1916',
    title: 'British Mandate Established',
    body: 'Following German defeat in World War I, the territory is partitioned between Britain and France. The British Southern Cameroons becomes a League of Nations Mandate territory under British administration.',
  },
  {
    era: 'colonial',
    year: '1946',
    title: 'UN Trust Territory',
    body: 'With the creation of the United Nations, the Southern Cameroons transitions to a UN Trust Territory under British administration, with an obligation to prepare the population for self-governance.',
  },
  {
    era: 'federation',
    year: '1961',
    title: 'The 1961 Plebiscite & Federation',
    body: 'Under UN Resolution 1608 (XV), Southern Cameroonians vote in a plebiscite. On 1 October 1961, the territory joins the Republic of Cameroon in a federal arrangement — the Federal Republic of Cameroon.',
  },
  {
    era: 'federation',
    year: '1961',
    title: 'Foumban Conference',
    body: 'The Foumban Constitutional Conference establishes the terms of federation. Critics argue the federal compact was never fully honoured by Yaoundé, undermining the constitutional bargain.',
  },
  {
    era: 'unitary',
    year: '1972',
    title: 'Abolition of the Federal System',
    body: 'President Ahmadou Ahidjo holds a referendum that abolishes the federation and imposes a unitary state — the Republic of Cameroon — without the constitutionally required federal consent.',
  },
  {
    era: 'restoration',
    year: '2016',
    title: 'Anglophone Crisis Begins',
    body: 'Lawyers and teachers in the Anglophone regions launch strikes against the imposition of French civil law and French language in Anglophone courts and schools. State repression escalates rapidly.',
  },
  {
    era: 'restoration',
    year: '2017',
    title: 'Declaration of Independence — 1 October 2017',
    body: 'The Interim Government of Ambazonia formally declares the independence of the Federal Republic of Ambazonia on 1 October 2017, citing the broken federal compact, UN Charter rights, and self-determination under international law.',
    highlight: true,
  },
  {
    era: 'restoration',
    year: '2017–present',
    title: 'Armed Conflict & Diaspora Governance',
    body: 'Ambazonian defence forces engage Cameroonian military occupation. The Interim Government operates from exile while maintaining institutional and diplomatic functions. Tens of thousands of civilians have been displaced.',
  },
]

export default function History() {
  return (
    <PageContainer>
      <PageHeading
        title="Historical Record"
        subtitle="A chronological account of the Ambazonian path to sovereignty — from colonial partition through federation, unitary annexation, and the contemporary restoration of independence."
      />

      {/* Era legend */}
      <div className="flex flex-wrap gap-2 mb-14">
        {taxonomyData.eras.map(era => (
          <div key={era.id} className="flex items-center gap-2 bg-navy-900 border border-navy-800 px-3 py-2">
            <span className="text-xs text-gold-500 font-sans">{era.range}</span>
            <span className="text-xs text-parchment-200/50 font-sans">— {era.label}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical rail */}
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-navy-700" />

        <div className="space-y-0">
          {timeline.map((event, i) => {
            const eraData = taxonomyData.eras.find(e => e.id === event.era)
            return (
              <div key={i} className="relative pl-16 md:pl-24 pb-10">
                {/* Node */}
                <div className={[
                  'absolute left-[13px] md:left-[26px] top-1.5 w-3 h-3 rounded-full border-2',
                  event.highlight
                    ? 'border-gold-500 bg-gold-500'
                    : 'border-navy-600 bg-navy-900',
                ].join(' ')} />

                {/* Entry */}
                <div className={event.highlight
                  ? 'bg-navy-900 border border-gold-600/25 p-6'
                  : ''
                }>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-sans text-gold-500 text-sm font-medium tabular-nums">
                      {event.year}
                    </span>
                    {eraData && (
                      <Badge variant="slate">{eraData.label}</Badge>
                    )}
                    {event.highlight && (
                      <Badge variant="gold">Key Event</Badge>
                    )}
                  </div>
                  <h3 className={[
                    'font-serif mb-2',
                    event.highlight ? 'text-parchment-50 text-xl' : 'text-navy-900 text-base',
                  ].join(' ')}>
                    {event.title}
                  </h3>
                  <p className="text-sm text-navy-700/70 font-sans leading-relaxed">
                    {event.body}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </PageContainer>
  )
}
