import { Link } from 'react-router-dom'
import { Phone, MessageCircle, ClipboardList } from 'lucide-react'
import { business, whatsappLink } from '../data/business'

export default function MobileActionBar() {
  return (
    <nav
      aria-label="Quick contact actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-3 divide-x divide-navy/10">
        <a
          href={business.phoneHref}
          className="flex flex-col items-center justify-center gap-1 py-3 text-navy active:bg-navy/5"
        >
          <Phone size={20} aria-hidden="true" />
          <span className="text-xs font-medium">Call</span>
        </a>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 bg-navy py-3 text-white active:bg-navy-light"
        >
          <MessageCircle size={20} aria-hidden="true" />
          <span className="text-xs font-medium">WhatsApp</span>
        </a>
        <Link
          to="/contact"
          className="flex flex-col items-center justify-center gap-1 py-3 text-navy active:bg-navy/5"
        >
          <ClipboardList size={20} aria-hidden="true" />
          <span className="text-xs font-medium">Quote</span>
        </Link>
      </div>
    </nav>
  )
}
