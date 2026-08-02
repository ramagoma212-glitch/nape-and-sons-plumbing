import { MessageCircle } from 'lucide-react'
import { whatsappLink } from '../data/business'

export default function WhatsAppButton({ message, className = 'btn-primary', children = 'Chat on WhatsApp' }) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={18} aria-hidden="true" />
      {children}
    </a>
  )
}
