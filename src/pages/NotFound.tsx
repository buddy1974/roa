import { Link } from 'react-router-dom'
import { RouteMeta } from '../components/seo/RouteMeta'
import { siteUrl } from '../lib/env'

export default function NotFound() {
  return (
    <>
      <RouteMeta
        title="Page Not Found — Republic of Ambazonia"
        description="The requested resource does not exist in this archive."
        canonical={`${siteUrl}/404`}
      />
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="h-px w-10 bg-gold-500 mx-auto mb-8" />
        <h1 className="font-serif text-parchment-100 text-4xl mb-4">
          Page Not Found
        </h1>
        <p className="text-parchment-200/50 font-sans mb-10">
          The requested resource does not exist in this archive.
        </p>
        <Link
          to="/"
          className="text-sm font-sans text-gold-400 hover:text-gold-300 transition-colors underline underline-offset-2"
        >
          Return to the archive
        </Link>
      </div>
    </>
  )
}
