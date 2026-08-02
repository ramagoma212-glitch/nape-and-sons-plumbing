import { CheckCircle2 } from 'lucide-react'
import completeBathroom from '../assets/projects/complete-bathroom-installation.jpeg'

const POINTS = [
  'Professional workmanship',
  'Reliable communication',
  'Residential and commercial plumbing',
  'Emergency assistance',
  'Practical plumbing solutions',
  'Service across Limpopo, Pretoria and Johannesburg',
]

export default function WhyChooseUs() {
  return (
    <section className="section bg-white">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <span className="eyebrow">Why Nape and Sons</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight text-navy">
            Why Choose Nape and Sons?
          </h2>
          <p className="mt-5 text-base sm:text-lg text-ink/70">
            We focus on getting plumbing work done properly the first time, with clear
            communication from enquiry to completion.
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-gold-dark" aria-hidden="true" />
                <span className="text-sm sm:text-base text-ink/80">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 lg:order-2">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-card-hover">
            <img
              src={completeBathroom}
              alt="Complete bathroom plumbing installation by Nape and Sons Plumbing & Projects"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
