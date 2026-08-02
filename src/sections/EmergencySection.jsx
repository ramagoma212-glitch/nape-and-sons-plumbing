import { AlertTriangle } from 'lucide-react'
import { business } from '../data/business'
import PhoneButton from '../components/PhoneButton'
import WhatsAppButton from '../components/WhatsAppButton'

export default function EmergencySection() {
  return (
    <section className="section bg-navy-light">
      <div className="container-page">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
            <AlertTriangle size={28} aria-hidden="true" />
          </span>
          <h2 className="max-w-xl text-3xl sm:text-4xl font-bold leading-tight text-white">
            Need Urgent Plumbing Assistance?
          </h2>
          <p className="max-w-xl text-base sm:text-lg text-white/75">
            For severe blocked drains, water loss and urgent plumbing problems, contact Nape and
            Sons directly for assistance.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <PhoneButton className="btn-primary">Call {business.phoneDisplay}</PhoneButton>
            <WhatsAppButton className="btn-outline-light" />
          </div>
        </div>
      </div>
    </section>
  )
}
