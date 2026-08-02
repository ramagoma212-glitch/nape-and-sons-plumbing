import { MessageCircle, Wrench, ShieldCheck } from 'lucide-react'
import SectionHeading from '../components/SectionHeading'

// Verified customer reviews have not been supplied yet. This section is built so
// real reviews (e.g. Google Reviews) can replace these cards later without any
// structural changes to the page.
const EXPECTATIONS = [
  {
    icon: MessageCircle,
    title: 'Clear Communication',
    description: 'We keep you informed from the first enquiry through to job completion.',
  },
  {
    icon: Wrench,
    title: 'Professional Workmanship',
    description: 'Plumbing work carried out with care, using suitable materials for each job.',
  },
  {
    icon: ShieldCheck,
    title: 'Reliable Service',
    description: 'Straightforward, practical solutions for residential and commercial plumbing.',
  },
]

export default function ExpectationsSection() {
  return (
    <section className="section bg-offwhite">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our Standard"
          title="What You Can Expect From Us"
          description="We are building our library of verified customer reviews. In the meantime, here is what guides every job we take on."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {EXPECTATIONS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card p-7 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy/5 text-navy">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-navy font-heading">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
