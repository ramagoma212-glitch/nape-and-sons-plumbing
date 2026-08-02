import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import WhatsAppButton from './WhatsAppButton'
import PhoneButton from './PhoneButton'

export default function CTASection({
  eyebrow,
  title,
  description,
  showCall = true,
  showWhatsapp = true,
  showQuote = true,
  variant = 'navy',
}) {
  const isDark = variant === 'navy'

  return (
    <section className={`section ${isDark ? 'bg-navy' : 'bg-white'}`}>
      <div className="container-page">
        <div className="flex flex-col items-center gap-6 text-center">
          {eyebrow && (
            <span className={`eyebrow ${isDark ? 'text-gold' : 'text-gold-dark'}`}>{eyebrow}</span>
          )}
          <h2
            className={`max-w-2xl text-3xl sm:text-4xl font-bold leading-tight ${
              isDark ? 'text-white' : 'text-navy'
            }`}
          >
            {title}
          </h2>
          {description && (
            <p className={`max-w-xl text-base sm:text-lg ${isDark ? 'text-white/75' : 'text-ink/70'}`}>
              {description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {showQuote && (
              <Link to="/contact" className="btn-primary">
                Request a Quote
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
            {showWhatsapp && (
              <WhatsAppButton className={isDark ? 'btn-outline-light' : 'btn-secondary'} />
            )}
            {showCall && (
              <PhoneButton className={isDark ? 'btn-outline-light' : 'btn-secondary'} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
