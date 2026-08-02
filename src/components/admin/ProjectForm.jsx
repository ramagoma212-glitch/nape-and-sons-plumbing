import { useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { categories } from '../../data/projects'
import {
  adminCreateProject,
  adminUpdateProject,
  adminUploadProjectImage,
  adminReplaceProjectImage,
} from '../../lib/projects'
import { adminAddProjectMedia } from '../../lib/media'
import MediaManager from './MediaManager'

const SELECTABLE_CATEGORIES = categories.filter((category) => category !== 'All')

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ProjectForm({ project, onSaved, onFinish }) {
  const [savedProject, setSavedProject] = useState(project ?? null)
  const isEditing = Boolean(savedProject)

  const [title, setTitle] = useState(project?.title ?? '')
  const [slug, setSlug] = useState(project?.slug ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [category, setCategory] = useState(project?.category ?? SELECTABLE_CATEGORIES[0])
  const [featured, setFeatured] = useState(project?.featured ?? false)
  const [displayOrder, setDisplayOrder] = useState(project?.display_order ?? 0)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(project?.image_url ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(isEditing)

  function handleTitleChange(value) {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!title.trim() || !slug.trim() || !category) {
      setError('Please fill in the title, slug and category.')
      return
    }
    if (!isEditing && !file) {
      setError('Please choose a cover image for this project.')
      return
    }

    setSubmitting(true)
    try {
      let imageUrl = savedProject?.image_url
      let imagePath = savedProject?.image_path
      let uploadedNewCover = null

      if (file) {
        uploadedNewCover = isEditing
          ? await adminReplaceProjectImage(file, savedProject?.image_path)
          : await adminUploadProjectImage(file)
        imageUrl = uploadedNewCover.url
        imagePath = uploadedNewCover.path
      }

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        category,
        featured,
        display_order: Number(displayOrder) || 0,
        image_url: imageUrl,
        image_path: imagePath,
        alt: `${title.trim()} by Nape and Sons Plumbing & Projects`,
      }

      const saved = isEditing
        ? await adminUpdateProject(savedProject.id, payload)
        : await adminCreateProject(payload)

      // Keep the new gallery system in sync: the cover image is also the
      // first gallery item. If this fails (e.g. migration not run yet), the
      // project itself is still saved fine via the legacy fields above.
      if (!isEditing && uploadedNewCover) {
        try {
          await adminAddProjectMedia({
            projectId: saved.id,
            mediaType: 'image',
            storagePath: uploadedNewCover.path,
            publicUrl: uploadedNewCover.url,
            displayOrder: 0,
          })
        } catch {
          // Non-fatal — the project still works via the legacy image fields.
        }
      }

      setSavedProject(saved)
      setFile(null)
      onSaved?.(saved)
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong saving this project.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy">Title</label>
            <input
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              className="rounded-md border border-navy/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy">Slug</label>
            <input
              value={slug}
              onChange={(event) => {
                setSlugTouched(true)
                setSlug(slugify(event.target.value))
              }}
              className="rounded-md border border-navy/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy">Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-md border border-navy/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              {SELECTABLE_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
              className="rounded-md border border-navy/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-navy">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="rounded-md border border-navy/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-navy">Cover Image</label>
          <p className="text-xs text-ink/50">
            The main image shown on project cards. Add more photos and videos below once the project is saved.
          </p>
          {preview && (
            <img src={preview} alt="Cover preview" className="h-40 w-full max-w-xs rounded-md object-cover" />
          )}
          <label className="btn-secondary w-fit cursor-pointer">
            <Upload size={16} aria-hidden="true" />
            {isEditing ? 'Replace Cover Image' : 'Upload Cover Image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
            className="h-4 w-4 rounded border-navy/30"
          />
          Feature on homepage
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
          </button>
          <button type="button" onClick={() => onFinish?.()} className="btn-secondary">
            Close
          </button>
        </div>
      </form>

      {savedProject && <MediaManager projectId={savedProject.id} />}
    </div>
  )
}
