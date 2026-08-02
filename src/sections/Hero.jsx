import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Building2, ShieldCheck, MapPin } from 'lucide-react'
import heroImage from '../assets/projects/modern-shower-installation.jpeg'
import { business } from '../data/business'
import WhatsAppButton from '../components/WhatsAppButton'

const TRUST_ITEMS = [
  { icon: Building2, label: 'Residential & Commercial' },
  { icon: ShieldCheck, label: 'Quality Workmanship' },
  { icon: MapPin, label: 'Limpopo, Pretoria & Johannesburg' },
]

export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-navy pt-20">
      <img
        src={heroImage}
        alt="Modern bathroom shower installation completed by Nape and Sons Plumbing & Projects"
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/60"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="container-page relative py-20 sm:py-24">
        <div className="max-w-xl fade-up">
          <span className="eyebrow text-gold">Professional Plumbing &amp; Projects</span>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-white">
            {business.headline}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-white/80 leading-relaxed">
            {business.supportingCopy}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/contact" className="btn-primary">
              Request a Quote
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <WhatsAppButton className="btn-outline-light" />
          </div>

          <ul className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-white/85">
                <Icon size={18} className="text-gold" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
