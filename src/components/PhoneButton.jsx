import { Phone } from 'lucide-react'
import { business } from '../data/business'

export default function PhoneButton({ className = 'btn-secondary', children }) {
  return (
    <a href={business.phoneHref} className={className} aria-label={`Call ${business.phoneDisplay}`}>
      <Phone size={18} aria-hidden="true" />
      {children || `Call ${business.phoneDisplay}`}
    </a>
  )
}
