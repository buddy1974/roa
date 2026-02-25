import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout }             from './components/layout/Layout'
import Home                   from './pages/Home'
import Governance             from './pages/Governance'
import Documents              from './pages/Documents'
import History                from './pages/History'
import Tourism                from './pages/Tourism'
import Continuity             from './pages/history/Continuity'
import Figures                from './pages/history/Figures'
import Timeline               from './pages/history/Timeline'
import JudicialProceedings    from './pages/legal/JudicialProceedings'
import Archive                from './pages/documents/Archive'
import DocumentView          from './pages/documents/DocumentView'
import Inquiry               from './pages/research/Inquiry'
import Authority             from './pages/about/Authority'
import Ledger                from './pages/about/Ledger'
import Redirects             from './pages/about/Redirects'
import ConstitutionalIndex   from './pages/constitutional/Index'
import Changelog             from './pages/about/Changelog'
import Orientation           from './pages/research/Orientation'
import NotFound              from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index                  element={<Home />} />
          <Route path="governance"      element={<Governance />} />
          <Route path="governance/:sub" element={<Governance />} />
          <Route path="documents"          element={<Documents />} />
          <Route path="documents/archive" element={<Archive />} />
          <Route path="documents/:slug"   element={<DocumentView />} />
          <Route path="history"                element={<History />} />
          <Route path="history/continuity"     element={<Continuity />} />
          <Route path="history/timeline"       element={<Timeline />} />
          <Route path="history/figures"        element={<Figures />} />
          <Route path="legal"                  element={<JudicialProceedings />} />
          <Route path="legal/proceedings"      element={<JudicialProceedings />} />
          <Route path="research/inquiry"       element={<Inquiry />} />
          <Route path="about/authority"        element={<Authority />} />
          <Route path="about/changelog"        element={<Changelog />} />
          <Route path="about/ledger"           element={<Ledger />} />
          <Route path="about/redirects"        element={<Redirects />} />
          <Route path="research/orientation"   element={<Orientation />} />
          <Route path="index"                  element={<ConstitutionalIndex />} />
          <Route path="tourism"                element={<Tourism />} />
          <Route path="404"                    element={<NotFound />} />
          <Route path="*"                      element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
