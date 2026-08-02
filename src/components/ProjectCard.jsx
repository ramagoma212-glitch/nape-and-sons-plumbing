import { Link } from 'react-router-dom'
import { Video } from 'lucide-react'
import { getCoverMedia, getFocalPosition } from '../lib/media'

export default function ProjectCard({ project, priority = false }) {
  const cover = getCoverMedia(project)
  const focal = getFocalPosition(project)

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="card group block overflow-hidden hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-navy/5">
        {cover.type === 'placeholder' ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-navy/5 text-navy/40">
            <Video size={32} aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-wide">Video Project</span>
          </div>
        ) : (
          <img
            src={cover.url}
            alt={project.alt || project.title}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              focal === 'top' ? 'object-top' : 'object-center'
            }`}
          />
        )}
      </div>
      <div className="p-5">
        <span className="eyebrow">{project.category}</span>
        <h3 className="mt-2 text-lg font-semibold text-navy font-heading">{project.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/70 line-clamp-2">
          {project.description}
        </p>
      </div>
    </Link>
  )
}
