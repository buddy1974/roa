import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Link } from 'react-router-dom'
import { PageContainer, PageHeading, SectionHeading } from '../components/layout/PageContainer'

const branches = [
  {
    id: 'executive',
    title: 'Executive Branch',
    badge: 'Executive',
    description:
      'The Interim Government of the Federal Republic of Ambazonia exercises executive authority. It is constituted to coordinate the restoration of independence and manage state affairs in exile and on the ground.',
    functions: [
      'Issuance of decrees and executive orders',
      'Appointment of ministers and diplomatic representatives',
      'Coordination of armed and civil resistance',
      'International engagement and treaty-making',
    ],
    path: '/governance/executive',
  },
  {
    id: 'legislative',
    title: 'Legislative Branch',
    badge: 'Legislative',
    description:
      'The legislative body of Ambazonia is mandated to draft, review, and enact laws consistent with the Constitution of the Federal Republic of Ambazonia.',
    functions: [
      'Enactment of legislation',
      'Review of executive acts',
      'Budget and fiscal oversight',
      'Ratification of treaties',
    ],
    path: '/governance/legislative',
  },
  {
    id: 'judiciary',
    title: 'Judicial Branch',
    badge: 'Judiciary',
    description:
      'The judiciary is the independent arbiter of law, tasked with interpretation of the Constitution and resolution of disputes in accordance with Ambazonian and international law.',
    functions: [
      'Constitutional interpretation',
      'Dispute resolution',
      'Upholding civil and human rights',
      'War crimes documentation',
    ],
    path: '/governance/judiciary',
  },
]

export default function Governance() {
  return (
    <PageContainer>
      <PageHeading
        title="Governance"
        subtitle="The constitutional structure of the Federal Republic of Ambazonia, established by the 2017 Constitution, divides state authority across three independent branches of government."
      />

      {/* Branches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
        {branches.map(branch => (
          <Card key={branch.id} variant="bordered" className="flex flex-col">
            <CardHeader>
              <Badge variant="gold" className="mb-3">{branch.badge}</Badge>
              <h2 className="font-serif text-parchment-100 text-xl">{branch.title}</h2>
            </CardHeader>
            <CardBody className="flex-1 flex flex-col">
              <p className="text-sm text-parchment-200/60 font-sans leading-relaxed mb-6">
                {branch.description}
              </p>
              <p className="text-xs text-gold-500 font-sans uppercase tracking-widest mb-3">
                Core Functions
              </p>
              <ul className="flex-1 space-y-2 mb-8">
                {branch.functions.map(fn => (
                  <li key={fn} className="flex items-start gap-2 text-sm text-parchment-200/65 font-sans">
                    <span className="text-gold-600 mt-0.5 flex-shrink-0 select-none">—</span>
                    {fn}
                  </li>
                ))}
              </ul>
              <Link
                to={branch.path}
                className="text-xs text-gold-500 hover:text-gold-400 font-sans uppercase tracking-widest transition-colors"
              >
                View Records →
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Decrees section */}
      <div className="border-t border-navy-800 pt-12">
        <div className="flex items-start justify-between mb-8">
          <SectionHeading title="Decrees & Orders" />
          <Link to="/governance/decrees" className="text-xs text-gold-500 hover:text-gold-400 font-sans uppercase tracking-widest transition-colors mt-1">
            View All →
          </Link>
        </div>
        <div className="bg-navy-900 border border-navy-800 p-8">
          <p className="text-sm text-parchment-200/40 font-sans italic leading-relaxed">
            Executive decrees, orders, and proclamations issued by the Interim Government will be listed here.
            This section is populated from the document archive.
          </p>
        </div>
      </div>
    </PageContainer>
  )
}
