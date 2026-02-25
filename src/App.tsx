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
import ConstitutionalIndex   from './pages/constitutional/Index'

function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-32 text-center">
      <div className="h-px w-10 bg-gold-500 mx-auto mb-8" />
      <h1 className="font-serif text-parchment-100 text-4xl mb-4">
        Page Not Found
      </h1>
      <p className="text-parchment-200/50 font-sans">
        The requested resource does not exist in this archive.
      </p>
    </div>
  )
}

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
          <Route path="index"                  element={<ConstitutionalIndex />} />
          <Route path="tourism"                element={<Tourism />} />
          <Route path="*"              element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
