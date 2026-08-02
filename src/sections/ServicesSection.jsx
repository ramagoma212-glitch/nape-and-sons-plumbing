import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '../components/SectionHeading'
import ServiceCard from '../components/ServiceCard'
import { services } from '../data/services'

export default function ServicesSection() {
  return (
    <section className="section bg-offwhite">
      <div className="container-page">
        <SectionHeading
          eyebrow="What We Do"
          title="Professional Plumbing Services"
          description="Practical plumbing solutions for residential and commercial properties, from everyday repairs to full installations."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/services" className="btn-secondary">
            View All Services
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
