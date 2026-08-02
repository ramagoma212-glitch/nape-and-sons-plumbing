import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Icon } from '../lib/icons'

export default function ServiceCard({ service }) {
  return (
    <div className="card group p-6 sm:p-7 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy/5 text-navy transition-colors group-hover:bg-gold group-hover:text-navy">
        <Icon name={service.icon} size={24} aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-navy font-heading">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">{service.description}</p>
      <Link
        to={`/services#${service.slug}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark hover:gap-2.5 transition-all"
      >
        Learn More
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  )
}
