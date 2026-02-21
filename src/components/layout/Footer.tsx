import { Link } from 'react-router-dom'
import navData from '../../data/navigation.json'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-900 border-t-2 border-gold-500 mt-20">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand column */}
        <div>
          <span className="block font-serif text-parchment-100 text-base mb-4">
            {navData.brand.name}
          </span>
          <p className="text-sm text-parchment-200/50 font-sans leading-relaxed max-w-xs">
            The sovereign digital knowledge platform of the Federal Republic of Ambazonia.
            Preserving institutional memory and advancing self-determination.
          </p>
        </div>

        {/* Navigation column */}
        <div>
          <h4 className="font-serif text-gold-400 text-sm uppercase tracking-widest mb-4">
            Platform
          </h4>
          <ul className="space-y-2">
            {navData.primaryNav.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className="text-sm text-parchment-200/60 hover:text-gold-300 font-sans transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal column */}
        <div>
          <h4 className="font-serif text-gold-400 text-sm uppercase tracking-widest mb-4">
            Information
          </h4>
          <ul className="space-y-2">
            {navData.footerNav.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="text-sm text-parchment-200/60 hover:text-gold-300 font-sans transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar with emblem on right */}
      <div className="border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-parchment-200/30 font-sans tracking-wide">
              &copy; {year} Republic of Ambazonia. All rights reserved.
            </p>
            <p className="text-xs text-parchment-200/25 font-sans tracking-widest uppercase mt-1">
              Republic of Ambazonia — West Africa
            </p>
          </div>
          <img
            src="/images/emblem.png"
            alt="Emblem of the Republic of Ambazonia"
            style={{ maxHeight: '80px' }}
            className="object-contain flex-shrink-0"
          />
        </div>
      </div>
    </footer>
  )
}
