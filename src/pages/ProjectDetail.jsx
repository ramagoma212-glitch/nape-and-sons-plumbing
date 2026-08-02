import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Seo from '../components/Seo'
import CTASection from '../components/CTASection'
import MediaGallery from '../components/MediaGallery'
import { getProjectBySlug } from '../lib/projects'
import { legacyMediaFor } from '../lib/media'

export default function ProjectDetail() {
  const { slug } = useParams()
  const [project, setProject] = useState(undefined) // undefined = loading, null = not found

  useEffect(() => {
    let active = true
    setProject(undefined)
    getProjectBySlug(slug).then((data) => {
      if (active) setProject(data ?? null)
    })
    return () => {
      active = false
    }
  }, [slug])

  if (project === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-navy" size={32} aria-hidden="true" />
      </div>
    )
  }

  if (project === null) {
    return (
      <div className="container-page section text-center">
        <h1 className="text-2xl font-bold text-navy">Project not found</h1>
        <p className="mt-3 text-ink/70">This project may have been moved or removed.</p>
        <Link to="/projects" className="btn-secondary mt-6 inline-flex">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Projects
        </Link>
      </div>
    )
  }

  const media =
    project.media && project.media.length > 0
      ? [...project.media].sort((a, b) => a.display_order - b.display_order)
      : legacyMediaFor(project)
  const [hero, ...rest] = media

  return (
    <>
      <Seo
        title={`${project.title} | Nape and Sons Plumbing & Projects`}
        description={project.description}
        path={`/projects/${project.slug}`}
        image={project.image_url}
      />

      <section className="bg-navy pt-28 pb-10">
        <div className="container-page">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-gold"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Projects
          </Link>
        </div>
      </section>

      <section className="bg-white pb-16 sm:pb-20">
        <div className="container-page -mt-4">
          <div className="overflow-hidden rounded-2xl shadow-card-hover">
            {hero?.media_type === 'video' ? (
              <video
                src={hero.public_url}
                controls
                playsInline
                preload="metadata"
                className="max-h-[560px] w-full object-cover"
              >
                Your browser does not support embedded video.
              </video>
            ) : (
              <img
                src={hero?.public_url || project.image_url}
                alt={project.alt || project.title}
                className={`max-h-[560px] w-full object-cover ${
                  project.focal === 'top' ? 'object-top' : 'object-center'
                }`}
                loading="eager"
                decoding="async"
              />
            )}
          </div>

          {rest.length > 0 && (
            <div className="mt-4">
              <MediaGallery media={rest} projectTitle={project.title} />
            </div>
          )}

          <div className="mt-8 max-w-2xl">
            <span className="eyebrow">{project.category}</span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight text-navy">
              {project.title}
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-ink/70">
              {project.description}
            </p>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Similar Work?"
        title="Need Similar Work?"
        description="Request a quote or send us a WhatsApp message and we'll get back to you about your project."
      />
    </>
  )
}
