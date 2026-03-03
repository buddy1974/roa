import { PageContainer } from '../../components/layout/PageContainer'
import { RouteMeta } from '../../components/seo/RouteMeta'
import { JsonLd } from '../../components/seo/JsonLd'
import { webPageSchema } from '../../components/seo/schemas'
import { siteUrl } from '../../lib/env'
import { ChatCore } from '../../components/chat/ChatCore'

const CHAT_WEBPAGE_SCHEMA = webPageSchema(
  `${siteUrl}/research/chat`,
  'Research Chat — Republic of Ambazonia (ROA)',
  'Deterministic, document-grounded conversational orientation using the institutional archive.',
  siteUrl,
)

export default function Chat() {
  return (
    <PageContainer
      breadcrumbOverrides={[
        { label: 'Home',     path: '/' },
        { label: 'Research', path: '/research/inquiry' },
        { label: 'Chat' },
      ]}
    >
      <RouteMeta
        title="Research Chat — Republic of Ambazonia (ROA)"
        description="Deterministic, document-grounded conversational orientation using the institutional archive."
        canonical={`${siteUrl}/research/chat`}
      />
      <JsonLd id="jsonld-webpage-chat" data={CHAT_WEBPAGE_SCHEMA} />

      <ChatCore mode="page" />
    </PageContainer>
  )
}
