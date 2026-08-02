import { useEffect, useState } from 'react'
import { Loader2, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import Seo from '../../components/Seo'
import ProjectForm from '../../components/admin/ProjectForm'
import EnquiriesPanel from '../../components/admin/EnquiriesPanel'
import { adminListProjects, adminDeleteProject } from '../../lib/projects'

const SECTIONS = [
  { id: 'projects', label: 'Projects' },
  { id: 'enquiries', label: 'Enquiries' },
]

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('projects')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function loadProjects() {
    setLoading(true)
    setError('')
    try {
      const data = await adminListProjects()
      setProjects(data)
    } catch (loadError) {
      setError(loadError.message || 'Could not load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  function openCreateForm() {
    setEditingProject(null)
    setFormOpen(true)
  }

  function openEditForm(project) {
    setEditingProject(project)
    setFormOpen(true)
  }

  function handleSaved() {
    // Keep the table in sync as soon as a project is created/edited, but
    // leave the form open so the owner can add photos/videos right away.
    loadProjects()
  }

  function handleFinish() {
    setFormOpen(false)
    setEditingProject(null)
    loadProjects()
  }

  async function handleDelete(project) {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return
    setDeletingId(project.id)
    try {
      await adminDeleteProject(project.id, project.image_path)
      setProjects((prev) => prev.filter((item) => item.id !== project.id))
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete this project.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Seo title="Admin Dashboard" description="Manage projects for Nape and Sons Plumbing & Projects." path="/admin/dashboard" noindex />

      <div className="flex gap-2 border-b border-navy/10">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'border-gold text-navy'
                : 'border-transparent text-ink/50 hover:text-navy'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === 'projects' && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-navy font-heading">Projects</h1>
              <p className="mt-1 text-sm text-ink/60">Manage the projects shown on your public website.</p>
            </div>
            {!formOpen && (
              <button type="button" onClick={openCreateForm} className="btn-primary">
                <Plus size={18} aria-hidden="true" />
                New Project
              </button>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {formOpen && (
            <div className="mt-6">
              <ProjectForm
                key={editingProject?.id ?? 'new'}
                project={editingProject}
                onSaved={handleSaved}
                onFinish={handleFinish}
              />
            </div>
          )}

          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-navy" size={28} aria-hidden="true" />
              </div>
            ) : projects.length === 0 ? (
              <div className="card p-10 text-center text-ink/60">
                No projects yet. Click &quot;New Project&quot; to add your first one.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-navy/10 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-navy/10 bg-navy/5 text-xs uppercase tracking-wide text-navy/60">
                    <tr>
                      <th className="px-4 py-3">Image</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Featured</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5">
                    {projects.map((project) => (
                      <tr key={project.id}>
                        <td className="px-4 py-3">
                          <img
                            src={project.image_url}
                            alt={project.alt || project.title}
                            className="h-12 w-16 rounded-md object-cover"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-navy">{project.title}</td>
                        <td className="px-4 py-3 text-ink/70">{project.category}</td>
                        <td className="px-4 py-3 text-ink/70">{project.display_order}</td>
                        <td className="px-4 py-3">
                          {project.featured && <Star size={16} className="text-gold" aria-hidden="true" />}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(project)}
                              className="rounded-md p-2 text-navy/70 hover:bg-navy/5 hover:text-navy"
                              aria-label={`Edit ${project.title}`}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(project)}
                              disabled={deletingId === project.id}
                              className="rounded-md p-2 text-red-500 hover:bg-red-50"
                              aria-label={`Delete ${project.title}`}
                            >
                              {deletingId === project.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'enquiries' && (
        <div className="mt-6">
          <div>
            <h1 className="text-2xl font-bold text-navy font-heading">Enquiries</h1>
            <p className="mt-1 text-sm text-ink/60">
              Contact, quote and booking requests submitted through the website.
            </p>
          </div>
          <div className="mt-8">
            <EnquiriesPanel />
          </div>
        </div>
      )}
    </>
  )
}
