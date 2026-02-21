import { Card, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { PageContainer, PageHeading, SectionHeading } from '../components/layout/PageContainer'
import taxonomyData from '../data/taxonomy.json'

const regions = [
  {
    id: 'sw',
    name: 'Southern Region',
    capital: 'Buea',
    area: '25,410 km²',
    description:
      'Home to Mount Fako — the highest peak in West and Central Africa — the Southern Region is characterised by volcanic highlands, coastal rainforest, and the industrial port of Limbe. Buea, the former capital of German Kamerun, sits at the foot of the mountain.',
    highlights: ['Mount Fako (4,095 m)', 'Limbe Coastal Zone', 'Korup National Park', 'Buea Historical District'],
    profile: 'Coastal, volcanic, rainforest ecology',
  },
  {
    id: 'nw',
    name: 'Northern Region',
    capital: 'Bamenda',
    area: '17,810 km²',
    description:
      'The Northern Region is a highland plateau of grasslands, volcanic lakes, and rich cultural heritage. Bamenda, the regional capital, has been a centre of civic resistance. The region is home to numerous traditional kingdoms (fondoms) with centuries of history.',
    highlights: ['Bamenda Highlands', 'Bafut Palace & Museum', 'Lake Nyos', 'Ndop Plain'],
    profile: 'Highland grasslands, traditional kingdoms, volcanic lakes',
  },
]

const naturalAssets = [
  { label: 'Mountains',     value: 'Mount Fako — 4,095 m' },
  { label: 'Forest Cover',  value: 'Korup & Banyang-Mbo rainforests' },
  { label: 'Water Bodies',  value: 'Atlantic coast, crater lakes, major rivers' },
  { label: 'Agriculture',   value: 'Cocoa, coffee, rubber, palm oil' },
  { label: 'Petroleum',     value: 'Offshore reserves in the Southern Region' },
  { label: 'Heritage Sites',value: 'Bafut Palace, German colonial monuments' },
]

const historicalStatus = [
  { period: '1946–1961', title: 'United Nations Trust Territory of Southern British Cameroons', org: 'United Nations' },
  { period: '1922–1945', title: 'League of Nations Mandated Territory Under United Kingdom Administration', org: 'League of Nations' },
  { period: '1916–1922', title: 'British Captured Territory following the defeat of Germany in World War I', org: 'British Administration' },
  { period: '1858–1887', title: 'Ambas Bay Colony — founded by English Baptist Missionary Society, capital at Victoria', org: 'British Settlement' },
  { period: 'Pre-colonial', title: 'First Westphalia state in the Gulf of Guinea', org: 'Historical' },
]

export default function Tourism() {
  return (
    <PageContainer>
      <PageHeading
        title="Territory of Ambazonia"
        subtitle="The Republic of Ambazonia is the former United Nations Trust Territory of Southern British Cameroons, located between Nigeria to the west and north, and Cameroun to the east — wedged between West Africa and the former French Equatorial Africa."
      />

      {/* Extended description */}
      <div className="max-w-3xl mb-12 space-y-4">
        <p className="text-base font-sans text-navy-700/80 leading-relaxed">
          If independent, Ambazonia would share maritime boundaries with Nigeria, the Republic of Cameroon, and Equatorial Guinea. Ambazonia has a land size of 43,000 square kilometres and a population of approximately 6 million people according to the Cameroon state census — though the census has long been subject to political manipulation, and the actual population is likely closer to 8 million.
        </p>
        <p className="text-base font-sans text-navy-700/80 leading-relaxed">
          It is thus slightly larger than the Netherlands, ranked the 131st largest country in terms of area, with about as many inhabitants as Paraguay, the world's 93rd most populous country. Ambazonia is more populous than at least 60 UN and 18 African Union Member States, and larger in area than at least 30 UN and 12 AU Member States.
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-navy-800 border border-navy-800 mb-16">
        {[
          { label: 'Total Area',           value: '43,000 km²' },
          { label: 'Estimated Population', value: '6–8 million' },
          { label: 'Administrative Regions', value: '2' },
          { label: 'Official Language',    value: 'English' },
        ].map(stat => (
          <div key={stat.label} className="bg-navy-900 px-6 py-5 text-center">
            <div className="font-serif text-gold-400 text-2xl mb-1 leading-none">{stat.value}</div>
            <div className="text-xs text-parchment-200/40 font-sans uppercase tracking-widest mt-2">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Historical status */}
      <div className="mb-16">
        <SectionHeading title="Historical Status" />
        <div className="space-y-3">
          {historicalStatus.map(item => (
            <div key={item.period} className="flex gap-4 border-l-2 border-gold-500/50 pl-4 py-2">
              <span className="text-xs font-sans text-gold-600 uppercase tracking-widest w-24 flex-shrink-0 pt-0.5 tabular-nums">
                {item.period}
              </span>
              <div>
                <p className="text-sm font-sans text-navy-900 font-medium leading-snug">{item.title}</p>
                <p className="text-xs font-sans text-navy-700/60 mt-0.5">{item.org}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regions */}
      <div className="mb-16">
        <SectionHeading title="Administrative Regions" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {regions.map(region => {
            const regionData = taxonomyData.regions.find(r => r.id === region.id)
            return (
              <Card key={region.id} variant="bordered">
                <CardBody>
                  <Badge variant="gold" className="mb-4">
                    {regionData?.label ?? region.name}
                  </Badge>
                  <h3 className="font-serif text-parchment-100 text-xl mb-1">{region.name}</h3>
                  <div className="flex gap-4 text-xs text-parchment-200/40 font-sans mb-5">
                    <span>Capital: {region.capital}</span>
                    <span>Area: {region.area}</span>
                  </div>
                  <p className="text-sm text-parchment-200/60 font-sans leading-relaxed mb-6">
                    {region.description}
                  </p>
                  <p className="text-xs text-gold-500 font-sans uppercase tracking-widest mb-1">Profile</p>
                  <p className="text-xs text-parchment-200/45 font-sans italic mb-5">{region.profile}</p>
                  <p className="text-xs text-gold-500 font-sans uppercase tracking-widest mb-2">Key Sites</p>
                  <ul className="space-y-1.5">
                    {region.highlights.map(h => (
                      <li key={h} className="flex items-center gap-2 text-sm text-parchment-200/60 font-sans">
                        <span className="text-gold-600 text-xs select-none">—</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Natural assets */}
      <div className="border-t border-navy-800 pt-12">
        <SectionHeading title="Natural & Cultural Assets" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-navy-800 border border-navy-800">
          {naturalAssets.map(asset => (
            <div key={asset.label} className="bg-navy-900 px-6 py-5">
              <p className="text-xs text-gold-500 font-sans uppercase tracking-widest mb-2">
                {asset.label}
              </p>
              <p className="text-sm text-parchment-200/70 font-sans leading-snug">
                {asset.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
