import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { business } from '../data/business'

export default function ServiceAreas() {
  return (
    <section className="section bg-navy">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow text-gold">Where We Work</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight text-white">
            Areas We Serve
          </h2>
          <p className="mt-5 text-base sm:text-lg text-white/75">
            Nape and Sons Plumbing &amp; Projects provides plumbing services to residential and
            commercial customers in Polokwane and surrounding areas in Limpopo, Pretoria and
            Johannesburg.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {business.areas.map((area) => (
            <div
              key={area}
              className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-6 text-white"
            >
              <MapPin size={20} className="text-gold" aria-hidden="true" />
              <span className="text-lg font-semibold font-heading">{area}</span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-white/60">
          <Link to="/plumber-polokwane" className="font-medium text-gold hover:underline">
            Learn more about our plumbing services in Polokwane
          </Link>
        </p>
      </div>
    </section>
  )
}
