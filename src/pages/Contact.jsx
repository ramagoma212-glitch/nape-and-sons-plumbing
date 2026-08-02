import { Phone, MessageCircle, Mail, MapPin, ExternalLink } from 'lucide-react'
import Seo from '../components/Seo'
import PageHero from '../components/PageHero'
import ContactForm from '../components/ContactForm'
import PhoneButton from '../components/PhoneButton'
import WhatsAppButton from '../components/WhatsAppButton'
import { business } from '../data/business'

const mapsQuery = encodeURIComponent(`${business.address}, Limpopo, South Africa`)
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

export default function Contact() {
  return (
    <>
      <Seo
        title="Contact Nape and Sons Plumbing & Projects"
        description="Contact Nape and Sons Plumbing & Projects for plumbing services across Limpopo, Pretoria and Johannesburg. Call, WhatsApp or request a quote."
        path="/contact"
      />

      <PageHero
        eyebrow="Get In Touch"
        title="Let's Talk About Your Plumbing Project"
        description="Reach out by phone, WhatsApp, or send us your details and we'll get back to you."
      >
        <div className="flex flex-wrap gap-3">
          <PhoneButton className="btn-primary" />
          <WhatsAppButton className="btn-outline-light" />
        </div>
      </PageHero>

      <section className="section bg-white">
        <div className="container-page grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="card p-6 sm:p-7">
              <h2 className="text-lg font-semibold text-navy font-heading">Contact Details</h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li>
                  <a href={business.phoneHref} className="flex items-center gap-3 text-ink/80 hover:text-navy">
                    <Phone size={18} className="text-gold-dark" aria-hidden="true" />
                    {business.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${business.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-ink/80 hover:text-navy"
                  >
                    <MessageCircle size={18} className="text-gold-dark" aria-hidden="true" />
                    {business.whatsappDisplay}
                  </a>
                </li>
                <li>
                  <a href={business.emailHref} className="flex items-center gap-3 text-ink/80 hover:text-navy">
                    <Mail size={18} className="text-gold-dark" aria-hidden="true" />
                    {business.email}
                  </a>
                </li>
                <li className="flex items-start gap-3 text-ink/80">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-gold-dark" aria-hidden="true" />
                  {business.address}
                </li>
              </ul>
            </div>

            <div className="card p-6 sm:p-7">
              <h2 className="text-lg font-semibold text-navy font-heading">Coverage</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {business.areas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-navy/15 px-3 py-1 text-xs font-medium text-navy/70"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="card p-6 sm:p-7">
              <h2 className="text-lg font-semibold text-navy font-heading">Location</h2>
              <p className="mt-3 text-sm text-ink/70">{business.address}</p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-4 w-full"
              >
                View on Google Maps
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-navy font-heading">Request a Quote</h2>
            <p className="mt-2 text-sm text-ink/60">
              Fill in your details below and we will get back to you regarding your enquiry.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
