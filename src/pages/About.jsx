import { CheckCircle2, MapPin } from 'lucide-react'
import Seo from '../components/Seo'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import CTASection from '../components/CTASection'
import { services } from '../data/services'
import { business } from '../data/business'
import showerImage from '../assets/projects/shower-installation.jpeg'
import geyserImage from '../assets/projects/geyser-system-installation.jpeg'

const APPROACH_POINTS = [
  'Understanding the problem before starting work',
  'Using suitable materials for each installation or repair',
  'Keeping clients informed throughout the job',
  'Leaving the work area clean on completion',
]

export default function About() {
  return (
    <>
      <Seo
        title="About Nape and Sons Plumbing & Projects"
        description="Nape and Sons Plumbing & Projects provides plumbing and project services for residential and commercial customers across Limpopo, Pretoria and Johannesburg."
        path="/about"
      />

      <PageHero
        eyebrow="About Us"
        title="About Nape and Sons Plumbing & Projects"
        description="We provide plumbing and project services for residential and commercial customers across Limpopo, Pretoria and Johannesburg."
      />

      <section className="section bg-white">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Who We Are</span>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-navy">Who We Are</h2>
            <p className="mt-5 text-base leading-relaxed text-ink/70">
              Nape and Sons Plumbing &amp; Projects is a plumbing and projects business serving
              homes and businesses. We handle everyday plumbing repairs and maintenance as well as
              larger installation and project work, including bathroom plumbing, geyser systems
              and backup water solutions.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink/70">
              Our work is centred on practical, reliable plumbing solutions delivered with
              professionalism and clear communication.
            </p>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-card-hover">
            <img
              src={showerImage}
              alt="Tiled shower installation completed by Nape and Sons Plumbing & Projects"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section bg-offwhite">
        <div className="container-page grid gap-10 sm:grid-cols-2">
          <div className="card p-8">
            <span className="eyebrow">Our Mission</span>
            <h2 className="mt-4 text-2xl font-bold text-navy font-heading">Our Mission</h2>
            <p className="mt-4 text-base leading-relaxed text-ink/70">
              To provide reliable, professional and practical plumbing solutions while
              maintaining high standards of workmanship and customer service.
            </p>
          </div>
          <div className="card p-8">
            <span className="eyebrow">Our Approach</span>
            <h2 className="mt-4 text-2xl font-bold text-navy font-heading">Our Approach</h2>
            <ul className="mt-4 space-y-3">
              {APPROACH_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-ink/75">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-gold-dark" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1 aspect-[4/3] overflow-hidden rounded-2xl shadow-card-hover">
            <img
              src={geyserImage}
              alt="Electric geyser system installation completed by Nape and Sons Plumbing & Projects"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <span className="eyebrow">Standards</span>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-navy">Quality Workmanship</h2>
            <p className="mt-5 text-base leading-relaxed text-ink/70">
              Whether it is a small repair or a full installation, we approach every job with the
              same attention to detail, using suitable materials and proper technique so the work
              is done right and lasts.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-navy">
        <div className="container-page">
          <SectionHeading
            eyebrow="Where We Work"
            title="Areas We Serve"
            description="Nape and Sons Plumbing & Projects provides plumbing services to residential and commercial customers across Limpopo, Pretoria and Johannesburg."
            light
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
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
        </div>
      </section>

      <section className="section bg-offwhite">
        <div className="container-page">
          <SectionHeading
            eyebrow="What We Offer"
            title="Our Services"
            description="A summary of the plumbing services we provide. Visit the Services page for full details."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.slug} className="card p-6">
                <h3 className="text-base font-semibold text-navy font-heading">{service.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Let's Get Started"
        title="Need a Plumber? Let's Talk."
        description="Tell us what you need and our team will get back to you regarding your plumbing project."
      />
    </>
  )
}
