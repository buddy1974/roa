import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import navData from '../../data/navigation.json'

export function Header() {
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { pathname }                        = useLocation()
  const dropdownRef                         = useRef<HTMLDivElement>(null)

  /* Close everything on route change */
  useEffect(() => {
    setActiveDropdown(null)
    setMobileOpen(false)
  }, [pathname])

  /* Click-outside closes open dropdown */
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  /** True when the current path falls under a nav item with children */
  function parentIsActive(item: (typeof navData.primaryNav)[number]) {
    return item.children?.some(c => pathname.startsWith(c.path)) ?? false
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-100 border-b border-slate-200">

      {/* Institutional strip */}
      <div className="border-b border-slate-200/70 bg-slate-200/40">
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between">
          <span className="text-xs font-sans tracking-widest uppercase" style={{ color: '#001020', opacity: 0.55 }}>
            Federal Republic of Ambazonia — Official Digital Platform
          </span>
          <span className="text-xs font-sans tracking-widest uppercase" style={{ color: '#C8B070', opacity: 0.85 }}>
            Est. 2017
          </span>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto pl-6 pr-6 py-5 flex items-center justify-between gap-8">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-4 group flex-shrink-0">
          <div
            className="flex-shrink-0 rounded-full overflow-hidden"
            style={{ width: '192px', height: '192px', background: '#ffffff', boxShadow: '0 0 0 1px rgba(0,16,32,0.08)' }}
          >
            <img
              src="/logo.png"
              alt="Republic of Ambazonia Emblem"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span
              className="block font-serif text-[17px] leading-tight transition-colors duration-200"
              style={{ color: '#001020' }}
            >
              {navData.brand.name}
            </span>
            <span
              className="block text-[10px] font-sans tracking-widest uppercase mt-0.5"
              style={{ color: '#001020', opacity: 0.4 }}
            >
              {navData.brand.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center" ref={dropdownRef}>
          {navData.primaryNav.map((item) => {
            const active = parentIsActive(item) || (!item.children && pathname === item.path)

            return (
              <div key={item.id} className="relative">
                {item.children ? (
                  <>
                    <button
                      onClick={() => setActiveDropdown(p => p === item.id ? null : item.id)}
                      aria-expanded={activeDropdown === item.id}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-sans tracking-wide transition-colors duration-150"
                      style={{
                        color: active || activeDropdown === item.id ? '#C8B070' : 'rgba(0,16,32,0.70)',
                      }}
                    >
                      {item.label}
                      <svg
                        width="9" height="5" viewBox="0 0 9 5" fill="currentColor"
                        className={`opacity-50 transition-transform duration-150 ${activeDropdown === item.id ? 'rotate-180' : ''}`}
                      >
                        <path d="M0 0l4.5 5L9 0z" />
                      </svg>
                    </button>

                    {/* Dropdown panel */}
                    {activeDropdown === item.id && (
                      <div
                        className="absolute top-full left-0 mt-1.5 w-52 bg-white border border-slate-200 shadow-lg z-50 overflow-hidden"
                      >
                        {item.children.map(child => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className="block px-4 py-2.5 text-sm font-sans border-b border-slate-200/70 last:border-0 transition-colors duration-150"
                            style={({ isActive }) => ({
                              color: isActive ? '#C8B070' : 'rgba(0,16,32,0.70)',
                              backgroundColor: isActive ? '#D8E0E8' : 'transparent',
                            })}
                            onMouseEnter={e => {
                              const el = e.currentTarget
                              el.style.backgroundColor = '#D8E0E8'
                              el.style.color = '#001020'
                            }}
                            onMouseLeave={e => {
                              const el = e.currentTarget
                              el.style.backgroundColor = ''
                              el.style.color = ''
                            }}
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    end
                    className="block px-4 py-2 text-sm font-sans tracking-wide transition-colors duration-150"
                    style={({ isActive }) => ({
                      color: isActive ? '#C8B070' : 'rgba(0,16,32,0.70)',
                    })}
                  >
                    {item.label}
                  </NavLink>
                )}

                {/* Active underline */}
                {active && (
                  <span className="absolute bottom-0 left-4 right-4 h-px" style={{ backgroundColor: '#C8B070' }} />
                )}
              </div>
            )
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 -mr-1 transition-colors"
          style={{ color: 'rgba(0,16,32,0.60)' }}
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <span className="block w-5 h-px bg-current transition-all duration-200"
            style={mobileOpen ? { transform: 'rotate(45deg) translate(0, 6px)' } : {}} />
          <span className="block w-5 h-px bg-current mt-1.5 transition-opacity duration-200"
            style={mobileOpen ? { opacity: 0 } : {}} />
          <span className="block w-5 h-px bg-current mt-1.5 transition-all duration-200"
            style={mobileOpen ? { transform: 'rotate(-45deg) translate(0, -6px)' } : {}} />
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-slate-200 bg-white">
          {navData.primaryNav.map((item) => (
            <div key={item.id} className="border-b border-slate-200/60">
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className="block px-6 py-3.5 text-sm font-sans transition-colors"
                style={({ isActive }) => ({
                  color: isActive || parentIsActive(item) ? '#C8B070' : 'rgba(0,16,32,0.70)',
                })}
              >
                {item.label}
              </NavLink>
              {item.children?.map(child => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className="block px-10 py-2.5 text-xs font-sans border-t border-slate-200/50 transition-colors"
                  style={({ isActive }) => ({
                    color: isActive ? '#C8B070' : 'rgba(0,16,32,0.50)',
                  })}
                >
                  {child.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      )}
    </header>
  )
}
