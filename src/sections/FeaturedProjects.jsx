import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '../components/SectionHeading'
import ProjectCard from '../components/ProjectCard'
import { getFeaturedProjects } from '../lib/projects'
import { fallbackProjects } from '../data/projects'

const initialFeatured = fallbackProjects.filter((project) => project.featured).slice(0, 6)

export default function FeaturedProjects() {
  const [projects, setProjects] = useState(initialFeatured)

  useEffect(() => {
    let active = true
    getFeaturedProjects(6).then((data) => {
      if (active) setProjects(data)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="section bg-offwhite">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our Work"
          title="Recent Projects"
          description="Take a look at some of our plumbing, water system, bathroom and geyser projects."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} priority={index < 2} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/projects" className="btn-secondary">
            View All Projects
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
