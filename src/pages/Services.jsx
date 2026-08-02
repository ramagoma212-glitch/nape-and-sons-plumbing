import { Link } from 'react-router-dom'
import { FileCheck2 } from 'lucide-react'
import Seo from '../components/Seo'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import CTASection from '../components/CTASection'
import PhoneButton from '../components/PhoneButton'
import { Icon } from '../lib/icons'
import { services, specialisedServices } from '../data/services'
import { useScrollToHash } from '../hooks/useScrollToHash'
import backupWaterImage from '../assets/projects/backup-water-storage-filtration-system.jpeg'
import geyserSolarImage from '../assets/projects/evacuated-tube-solar-geyser.jpeg'

export default function Services() {
  useScrollToHash()

  return (
    <>
      <Seo
        title="Plumbing Services Limpopo, Pretoria & Johannesburg | Nape and Sons"
        description="Plumbing solutions for homes, businesses and property projects across Limpopo, Pretoria and Johannesburg, including drains, leaks, geysers and pipe repairs."
        path="/services"
      />

      <PageHero
        eyebrow="What We Do"
        title="Professional Plumbing Services"
        description="Plumbing solutions for homes, businesses and property projects across Limpopo, Pretoria and Johannesburg."
      />

      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="Core Services"
            title="Everyday Plumbing Services"
            description="Practical, reliable solutions for the plumbing issues homes and businesses face most often."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.slug}
                id={service.slug}
                className="card scroll-mt-24 p-7 sm:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy/5 text-navy">
                  <Icon name={service.icon} size={24} aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-navy font-heading">{service.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{service.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-offwhite">
        <div className="container-page">
          <SectionHeading
            eyebrow="Specialised Work"
            title="Specialised Services"
            description="Larger plumbing needs that go beyond everyday repairs."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {specialisedServices.map((service) => (
              <div key={service.slug} id={service.slug} className="card scroll-mt-24 p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy/5 text-navy">
                  <Icon name={service.icon} size={24} aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-navy font-heading">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{service.description}</p>
                <ul className="mt-4 space-y-2">
                  {service.points.map((point) => (
                    <li key={point} className="text-sm text-ink/70">
                      &bull; {point}
                    </li>
                  ))}
                </ul>
                {service.cta && (
                  <div className="mt-5">
                    <PhoneButton className="btn-ghost text-sm">{service.cta}</PhoneButton>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Backup Water</span>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-navy">Backup Water Systems</h2>
            <p className="mt-5 text-base leading-relaxed text-ink/70">
              We install water tanks, pumps, filtration units and supply plumbing to keep water
              available even when it is needed most.
            </p>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-card-hover">
            <img
              src={backupWaterImage}
              alt="Backup water storage tanks with filtration and pump system installed by Nape and Sons Plumbing & Projects"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section bg-offwhite">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1 aspect-[4/3] overflow-hidden rounded-2xl shadow-card-hover">
            <img
              src={geyserSolarImage}
              alt="Evacuated tube solar geyser installation on a tiled roof by Nape and Sons Plumbing & Projects"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <span className="eyebrow">Hot Water</span>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-navy">
              Geyser and Solar Water Systems
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink/70">
              Electric geyser installation, geyser repairs, solar geyser systems and the plumbing
              connections that go with them.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <div className="card mx-auto flex max-w-3xl flex-col items-center gap-4 p-8 text-center sm:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/5 text-navy">
              <FileCheck2 size={24} aria-hidden="true" />
            </span>
            <h2 className="text-2xl font-bold text-navy font-heading">Compliance Certificates</h2>
            <p className="text-sm leading-relaxed text-ink/70 sm:text-base">
              Plumbing compliance documentation can be discussed where applicable for property
              transactions or insurance requirements. Please{' '}
              <Link to="/contact" className="font-semibold text-gold-dark underline">
                contact us
              </Link>{' '}
              to discuss your specific requirements.
            </p>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Ready When You Are"
        title="Need a Plumber? Let's Talk."
        description="Tell us what you need and our team will get back to you regarding your plumbing project."
      />
    </>
  )
}
