import { Link } from 'react-router-dom'
import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react'
import { business } from '../data/business'
import { services } from '../data/services'
import logo from '../assets/logo.png'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-dark text-white/80">
      <div className="container-page section grid gap-10 sm:grid-cols-2 lg:grid-cols-4 !py-14">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Nape and Sons Plumbing &amp; Projects logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span>
              <span className="font-heading text-lg font-bold text-white">Nape and Sons</span>
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Plumbing &amp; Projects</p>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Professional plumbing services for homes and businesses across Limpopo, Pretoria and
            Johannesburg.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Navigation</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-gold">Home</Link></li>
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
            <li><Link to="/services" className="hover:text-gold">Services</Link></li>
            <li><Link to="/projects" className="hover:text-gold">Projects</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.map((service) => (
              <li key={service.slug}>
                <Link to={`/services#${service.slug}`} className="hover:text-gold">
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={business.phoneHref} className="flex items-center gap-2.5 hover:text-gold">
                <Phone size={16} aria-hidden="true" /> {business.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${business.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-gold"
              >
                <MessageCircle size={16} aria-hidden="true" /> {business.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={business.emailHref} className="flex items-center gap-2.5 hover:text-gold">
                <Mail size={16} aria-hidden="true" /> {business.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {business.address}
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {business.areas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 sm:flex-row">
          <p>
            &copy; {year} {business.name}. All rights reserved.
          </p>
          <p>Built with 🩵 by Anani RM Digitals</p>
        </div>
      </div>
    </footer>
  )
}
