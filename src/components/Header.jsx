import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Phone } from 'lucide-react'
import { business } from '../data/business'
import logo from '../assets/brand/nape-and-sons-logo.png'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-navy/95 backdrop-blur shadow-md'
          : 'bg-navy/40 backdrop-blur-sm'
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 leading-tight"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src={logo}
            alt="Nape and Sons Plumbing &amp; Projects logo"
            width={68}
            height={68}
            className="h-14 w-14 shrink-0 object-contain sm:h-[68px] sm:w-[68px]"
          />
          <span className="flex flex-col">
            <span className="font-heading text-lg sm:text-xl font-bold text-white">
              Nape and Sons
            </span>
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-gold">
              Plumbing &amp; Projects
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-gold ${
                  isActive ? 'text-gold' : 'text-white/90'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href={business.phoneHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-gold"
            aria-label={`Call ${business.phoneDisplay}`}
          >
            <Phone size={16} aria-hidden="true" />
            {business.phoneDisplay}
          </a>
          <Link to="/contact" className="btn-primary">
            Request a Quote
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-md text-white"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          className="lg:hidden border-t border-white/10 bg-navy px-5 pb-8 pt-4"
          aria-label="Mobile"
        >
          <ul className="flex flex-col divide-y divide-white/10">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `block py-4 text-base font-medium ${isActive ? 'text-gold' : 'text-white/90'}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link to="/contact" className="btn-primary mt-6 w-full">
            Request a Quote
          </Link>
        </nav>
      )}
    </header>
  )
}
