import { useEffect, useMemo, useState } from 'react'
import Seo from '../components/Seo'
import PageHero from '../components/PageHero'
import ProjectCard from '../components/ProjectCard'
import CTASection from '../components/CTASection'
import { getProjects } from '../lib/projects'
import { fallbackProjects, categories } from '../data/projects'

export default function Projects() {
  const [projects, setProjects] = useState(fallbackProjects)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    let active = true
    getProjects().then((data) => {
      if (active) setProjects(data)
    })
    return () => {
      active = false
    }
  }, [])

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects
    return projects.filter((project) => project.category === activeCategory)
  }, [projects, activeCategory])

  return (
    <>
      <Seo
        title="Plumbing Projects | Nape and Sons Plumbing & Projects"
        description="Explore plumbing, bathroom, geyser and water system projects completed by Nape and Sons Plumbing & Projects across Limpopo, Pretoria and Johannesburg."
        path="/projects"
      />

      <PageHero
        eyebrow="Our Portfolio"
        title="Our Projects"
        description="Explore plumbing, bathroom, geyser and water system projects completed by Nape and Sons Plumbing & Projects."
      />

      <section className="section bg-white">
        <div className="container-page">
          <div
            className="flex flex-wrap justify-center gap-2.5"
            role="tablist"
            aria-label="Filter projects by category"
          >
            {categories.map((category) => {
              const isActive = category === activeCategory
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-gold bg-gold text-navy'
                      : 'border-navy/15 bg-white text-navy/70 hover:border-gold/60'
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>

          {filteredProjects.length === 0 ? (
            <p className="mt-16 text-center text-ink/60">
              No projects in this category yet. Please check back soon.
            </p>
          ) : (
            <div
              key={activeCategory}
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="fade-up"
                  style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
                >
                  <ProjectCard project={project} priority={index < 2} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection
        eyebrow="Similar Work?"
        title="Need a Plumber? Let's Talk."
        description="Tell us what you need and our team will get back to you regarding your plumbing project."
      />
    </>
  )
}
