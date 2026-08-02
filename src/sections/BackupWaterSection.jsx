import { CheckCircle2 } from 'lucide-react'
import tankImage from '../assets/projects/backup-water-storage-filtration-system.jpeg'

const ITEMS = [
  'Water tank installations',
  'Water pumps',
  'Filtration systems',
  'Plumbing connections',
  'Water distribution systems',
]

export default function BackupWaterSection() {
  return (
    <section className="section bg-white">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-card-hover">
            <img
              src={tankImage}
              alt="Backup water storage tanks with filtration and pump system installed by Nape and Sons Plumbing & Projects"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div>
          <span className="eyebrow">Water Security</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight text-navy">
            Backup Water Solutions
          </h2>
          <p className="mt-5 text-base sm:text-lg text-ink/70">
            Reliable backup water systems for properties that need consistent water supply,
            including storage, pumping and filtration.
          </p>

          <ul className="mt-8 space-y-3">
            {ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 size={20} className="shrink-0 text-gold-dark" aria-hidden="true" />
                <span className="text-sm sm:text-base text-ink/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
