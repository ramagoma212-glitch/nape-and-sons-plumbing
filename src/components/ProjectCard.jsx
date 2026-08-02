import { Link } from 'react-router-dom'

export default function ProjectCard({ project, priority = false }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="card group block overflow-hidden hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-navy/5">
        <img
          src={project.image_url}
          alt={project.alt || project.title}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            project.focal === 'top' ? 'object-top' : 'object-center'
          }`}
        />
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
