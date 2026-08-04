import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, MapPin } from 'lucide-react'
import Seo from '../components/Seo'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import ServiceCard from '../components/ServiceCard'
import ProjectCard from '../components/ProjectCard'
import CTASection from '../components/CTASection'
import PhoneButton from '../components/PhoneButton'
import { Icon } from '../lib/icons'
import { services, specialisedServices } from '../data/services'
import { business } from '../data/business'
import { getFeaturedProjects } from '../lib/projects'
import { fallbackProjects } from '../data/projects'

const WHY_CHOOSE_POINTS = [
  'Professional workmanship',
  'Reliable communication',
  'Residential and commercial plumbing',
  'Emergency assistance',
  'Practical plumbing solutions',
]

const FAQS = [
  {
    question: 'Do you provide plumbing services in Polokwane?',
    answer:
      'Yes. Nape and Sons Plumbing & Projects provides plumbing services to homes, businesses and property projects in Polokwane and surrounding areas in Limpopo.',
  },
  {
    question: 'Is Brain Plumber the same as Nape and Sons Plumbing & Projects?',
    answer:
      'Yes. Brain Plumber is a name many customers use for the person/business behind Nape and Sons Plumbing & Projects.',
  },
  {
    question: 'Do you install and repair geysers in Polokwane?',
    answer:
      'Yes. We handle electric and solar geyser installations, repairs and maintenance for homes and businesses in Polokwane.',
  },
  {
    question: 'Can I request emergency plumbing assistance in Polokwane?',
    answer:
      'Yes. For severe blocked drains, total water loss or urgent plumbing faults, call or WhatsApp us directly and we will assist as soon as we can.',
  },
  {
    question: 'Do you install water tanks and pumps?',
    answer:
      'Yes. We install water tanks, pumps and filtration systems as part of our backup water system services.',
  },
]

const initialFeatured = fallbackProjects.filter((project) => project.featured).slice(0, 3)

export default function PlumberPolokwane() {
  const [projects, setProjects] = useState(initialFeatured)

  useEffect(() => {
    let active = true
    getFeaturedProjects(3).then((data) => {
      if (active) setProjects(data)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <Seo
        title="Plumber Polokwane | Nape and Sons Plumbing & Projects"
        description="Need a plumber in Polokwane? Nape and Sons Plumbing & Projects provides geyser installations, drain cleaning, pipe repairs, bathroom plumbing and water system services across Polokwane and surrounding Limpopo areas."
        path="/plumber-polokwane"
      />

      <PageHero
        eyebrow="Local Plumber"
        title="Professional Plumber in Polokwane"
        description="Nape and Sons Plumbing & Projects provides plumbing services to homes, businesses and property projects in Polokwane and surrounding Limpopo areas."
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/contact" className="btn-primary">
            Request a Quote
          </Link>
          <PhoneButton className="btn-outline-light" />
        </div>
      </PageHero>

      <section className="section bg-white">
        <div className="container-page max-w-3xl">
          <p className="text-base leading-relaxed text-ink/70">
            Looking for a reliable plumber in Polokwane? Nape and Sons Plumbing &amp; Projects
            handles everyday plumbing repairs and maintenance as well as larger installation and
            project work for homes and businesses in Polokwane and surrounding Limpopo areas. Some
            customers in the area also know the business as{' '}
            <strong className="font-semibold text-navy">Brain Plumber</strong>.
          </p>
        </div>
      </section>

      <section className="section bg-offwhite">
        <div className="container-page">
          <SectionHeading
            eyebrow="Services"
            title="Plumbing Services in Polokwane"
            description="Practical, reliable plumbing solutions for the issues homes and businesses in Polokwane face most often."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-ink/60">
            <Link to="/services" className="font-medium text-gold-dark underline">
              See our full range of plumbing services
            </Link>
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Specialised Work"
            title="Emergency, Geyser and Backup Water Services"
            description="Larger plumbing needs for Polokwane homes and businesses, beyond everyday repairs."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {specialisedServices.map((service) => (
              <div key={service.slug} className="card p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy/5 text-navy">
                  <Icon name={service.icon} size={24} aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-navy font-heading">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-navy">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow text-gold">Why Choose Us</span>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white">
              Why Choose Nape and Sons
            </h2>
            <p className="mt-5 text-base sm:text-lg text-white/75">
              Reliable plumbing services for Polokwane homes and businesses, with clear
              communication from enquiry to completion.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {WHY_CHOOSE_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-white/85">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                <span className="text-sm sm:text-base">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-offwhite">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our Work"
            title="Recent Projects"
            description="A look at some of our completed plumbing, bathroom, geyser and water system projects."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link to="/projects" className="btn-secondary">
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Where We Work"
            title="Areas Around Polokwane"
            description="Looking for a plumber around Polokwane (PLK) or surrounding Limpopo areas? We also serve Pretoria and Johannesburg."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {business.areas.map((area) => (
              <div
                key={area}
                className="flex items-center justify-center gap-3 rounded-xl border border-navy/10 bg-offwhite py-6"
              >
                <MapPin size={20} className="text-gold-dark" aria-hidden="true" />
                <span className="text-lg font-semibold font-heading text-navy">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-offwhite">
        <div className="container-page max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />
          <div className="mt-10 space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.question} className="card p-6">
                <h3 className="text-base font-semibold text-navy font-heading">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Get In Touch"
        title="Need a Plumber in Polokwane? Let's Talk."
        description="Tell us what you need and our team will get back to you regarding your plumbing project."
      />
    </>
  )
}
