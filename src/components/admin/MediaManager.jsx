import { useEffect, useState } from 'react'
import { Loader2, Trash2, ArrowUp, ArrowDown, Upload, CheckCircle2, XCircle } from 'lucide-react'
import {
  adminListProjectMedia,
  adminAddProjectMedia,
  adminUpdateProjectMedia,
  adminDeleteProjectMedia,
  adminUploadMediaFile,
  validateMediaFile,
} from '../../lib/media'

export default function MediaManager({ projectId }) {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [uploads, setUploads] = useState([])

  async function loadMedia() {
    setLoading(true)
    setLoadError('')
    try {
      const data = await adminListProjectMedia(projectId)
      setMedia(data)
    } catch {
      setLoadError('Could not load photos and videos for this project.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMedia()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  async function handleFilesSelected(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (files.length === 0) return

    let nextOrder = media.length > 0 ? Math.max(...media.map((item) => item.display_order)) + 1 : 0

    for (const file of files) {
      const key = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`
      setUploads((prev) => [...prev, { key, name: file.name, status: 'uploading', error: '' }])

      const validation = validateMediaFile(file)
      if (!validation.valid) {
        setUploads((prev) =>
          prev.map((upload) => (upload.key === key ? { ...upload, status: 'error', error: validation.error } : upload)),
        )
        continue
      }

      try {
        const uploaded = await adminUploadMediaFile(file)
        const row = await adminAddProjectMedia({
          projectId,
          mediaType: uploaded.mediaType,
          storagePath: uploaded.path,
          publicUrl: uploaded.url,
          displayOrder: nextOrder,
        })
        nextOrder += 1
        setMedia((prev) => [...prev, row].sort((a, b) => a.display_order - b.display_order))
        setUploads((prev) => prev.map((upload) => (upload.key === key ? { ...upload, status: 'success' } : upload)))
      } catch (error) {
        setUploads((prev) =>
          prev.map((upload) =>
            upload.key === key ? { ...upload, status: 'error', error: error.message || 'Upload failed.' } : upload,
          ),
        )
      }
    }
  }

  async function handleDelete(item) {
    if (!window.confirm('Remove this photo/video? This cannot be undone.')) return
    try {
      await adminDeleteProjectMedia(item)
      setMedia((prev) => prev.filter((row) => row.id !== item.id))
    } catch {
      window.alert('Could not remove this item. Please try again.')
    }
  }

  async function handleMove(item, direction) {
    const sorted = [...media].sort((a, b) => a.display_order - b.display_order)
    const index = sorted.findIndex((row) => row.id === item.id)
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= sorted.length) return

    const a = sorted[index]
    const b = sorted[swapIndex]
    try {
      await Promise.all([
        adminUpdateProjectMedia(a.id, { display_order: b.display_order }),
        adminUpdateProjectMedia(b.id, { display_order: a.display_order }),
      ])
      setMedia((prev) =>
        prev.map((row) => {
          if (row.id === a.id) return { ...row, display_order: b.display_order }
          if (row.id === b.id) return { ...row, display_order: a.display_order }
          return row
        }),
      )
    } catch {
      window.alert('Could not reorder items. Please try again.')
    }
  }

  async function handleCaptionBlur(item, value) {
    if (value === (item.caption || '')) return
    try {
      await adminUpdateProjectMedia(item.id, { caption: value || null })
      setMedia((prev) => prev.map((row) => (row.id === item.id ? { ...row, caption: value || null } : row)))
    } catch {
      window.alert('Could not save the caption. Please try again.')
    }
  }

  const sortedMedia = [...media].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="space-y-4 rounded-xl border border-navy/10 bg-offwhite/60 p-4">
      <div>
        <h3 className="text-sm font-semibold text-navy">Project Photos & Videos</h3>
        <p className="mt-1 text-xs text-ink/60">
          Add multiple photos and optional videos for this project. Images: JPEG/PNG/WebP up to 5MB. Videos:
          MP4/WebM up to 50MB.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-navy" size={22} aria-hidden="true" />
        </div>
      ) : loadError ? (
        <p className="text-sm text-red-600">{loadError}</p>
      ) : (
        <>
          {sortedMedia.length === 0 && uploads.length === 0 && (
            <p className="text-sm text-ink/50">No photos or videos added yet.</p>
          )}

          {sortedMedia.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sortedMedia.map((item, index) => (
                <div key={item.id} className="rounded-lg border border-navy/10 bg-white p-2">
                  <div className="aspect-video overflow-hidden rounded-md bg-navy/5">
                    {item.media_type === 'video' ? (
                      <video
                        src={item.public_url}
                        controls
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.public_url}
                        alt={item.caption || 'Project media'}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <input
                    type="text"
                    defaultValue={item.caption || ''}
                    placeholder="Optional caption"
                    onBlur={(event) => handleCaptionBlur(item, event.target.value.trim())}
                    className="mt-2 w-full rounded border border-navy/10 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gold/50"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(item, 'up')}
                        disabled={index === 0}
                        className="rounded p-1 text-navy/60 hover:bg-navy/5 disabled:opacity-30"
                        aria-label="Move earlier"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(item, 'down')}
                        disabled={index === sortedMedia.length - 1}
                        className="rounded p-1 text-navy/60 hover:bg-navy/5 disabled:opacity-30"
                        aria-label="Move later"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploads.length > 0 && (
            <ul className="space-y-1.5">
              {uploads.map((upload) => (
                <li key={upload.key} className="flex items-center gap-2 text-xs">
                  {upload.status === 'uploading' && (
                    <Loader2 size={14} className="animate-spin text-navy/60" aria-hidden="true" />
                  )}
                  {upload.status === 'success' && <CheckCircle2 size={14} className="text-green-600" aria-hidden="true" />}
                  {upload.status === 'error' && <XCircle size={14} className="text-red-500" aria-hidden="true" />}
                  <span className="truncate text-ink/70">{upload.name}</span>
                  {upload.status === 'uploading' && <span className="text-ink/40">Uploading...</span>}
                  {upload.status === 'success' && <span className="text-green-600">Upload successful</span>}
                  {upload.status === 'error' && (
                    <span className="text-red-500">{upload.error || 'Upload failed'}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <label className="btn-secondary w-fit cursor-pointer text-sm">
        <Upload size={16} aria-hidden="true" />
        Add Photos or Videos
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          onChange={handleFilesSelected}
          className="hidden"
        />
      </label>
    </div>
  )
}
