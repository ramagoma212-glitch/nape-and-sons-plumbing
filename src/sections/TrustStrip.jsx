import { ShieldCheck, Award, Clock, MapPinned } from 'lucide-react'

const ITEMS = [
  { icon: Award, label: 'Professional Service' },
  { icon: ShieldCheck, label: 'Quality Workmanship' },
  { icon: Clock, label: 'Fast Response' },
  { icon: MapPinned, label: 'Multiple Service Areas' },
]

export default function TrustStrip() {
  return (
    <section className="border-b border-navy/5 bg-white py-8 sm:py-10">
      <div className="container-page grid grid-cols-2 gap-6 sm:grid-cols-4">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
              <Icon size={20} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-navy/80">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
