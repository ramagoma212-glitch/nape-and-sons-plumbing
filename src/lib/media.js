import { supabase, isSupabaseConfigured } from './supabaseClient'

export const MEDIA_LIMITS = {
  image: {
    bucket: 'project-images',
    types: ['image/jpeg', 'image/png', 'image/webp'],
    maxBytes: 5 * 1024 * 1024,
    label: 'JPEG, PNG or WebP, up to 5MB.',
  },
  video: {
    // Supabase's Free plan enforces a 50MB per-file upload ceiling at the
    // platform level, regardless of a bucket's own file_size_limit setting.
    // This is kept at 50MB (not the aspirational 100MB from the original
    // bucket config) so client-side validation matches what will actually
    // succeed, instead of accepting a file that Supabase will then reject.
    bucket: 'project-videos',
    types: ['video/mp4', 'video/webm'],
    maxBytes: 50 * 1024 * 1024,
    label: 'MP4 or WebM, up to 50MB.',
  },
}

const DEFAULT_EXTENSION = { image: 'jpg', video: 'mp4' }

/** Derives a safe storage-path extension from an original filename. The
 *  original name is never used as (or part of) the actual storage path —
 *  only this sanitised extension is kept, and only alongside a random UUID
 *  — so unusual characters, path separators or double extensions in a
 *  customer/admin-supplied filename can't influence the resulting object
 *  key. The actual file type accepted is still enforced server-side by the
 *  bucket's allowed_mime_types, independent of this string. */
export function sanitizeExtension(filename, mediaType) {
  const raw = (filename || '').split('.').pop() || ''
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5)
  return cleaned || DEFAULT_EXTENSION[mediaType]
}

function classifyFile(file) {
  if (MEDIA_LIMITS.image.types.includes(file.type)) return 'image'
  if (MEDIA_LIMITS.video.types.includes(file.type)) return 'video'
  return null
}

/** Validates a file before upload. Never assume the browser's `accept` filter was respected. */
export function validateMediaFile(file) {
  const mediaType = classifyFile(file)
  if (!mediaType) {
    const looksLikeVideo = file.type.startsWith('video/')
    return {
      valid: false,
      error: looksLikeVideo
        ? 'Unsupported video format. Please upload MP4 or WebM.'
        : 'Unsupported file type. Please upload a JPEG, PNG, WebP photo or an MP4/WebM video.',
    }
  }
  const limits = MEDIA_LIMITS[mediaType]
  if (file.size > limits.maxBytes) {
    const maxMb = Math.round(limits.maxBytes / (1024 * 1024))
    return {
      valid: false,
      error:
        mediaType === 'video'
          ? `Video is too large. Maximum file size is ${maxMb}MB.`
          : `Photo is too large. Maximum file size is ${maxMb}MB.`,
    }
  }
  return { valid: true, mediaType }
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.')
  }
}

/** Uploads a validated file to the correct bucket (image or video) and returns its public URL. */
export async function adminUploadMediaFile(file) {
  requireSupabase()
  const validation = validateMediaFile(file)
  if (!validation.valid) throw new Error(validation.error)

  const { mediaType } = validation
  const bucket = MEDIA_LIMITS[mediaType].bucket
  const extension = sanitizeExtension(file.name, mediaType)
  const path = `${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) {
    // Log the real Supabase error for debugging without exposing raw
    // storage internals in the admin UI.
    console.error(`Supabase storage upload error (${bucket}):`, error)
    throw new Error(mediaType === 'video' ? 'Video upload failed. Please try again.' : 'Photo upload failed. Please try again.')
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { mediaType, bucket, path, url: data.publicUrl }
}

/**
 * Fetches media for a set of project ids in one batched query, grouped by
 * project id and sorted by display_order. Returns an empty map (rather than
 * throwing) if project_media doesn't exist yet — e.g. before migration
 * 002_project_media.sql has been run — so the rest of the app can safely
 * fall back to each project's single legacy image.
 */
export async function getProjectMediaMap(projectIds) {
  const map = new Map()
  if (!isSupabaseConfigured || !supabase || projectIds.length === 0) return map

  try {
    const { data, error } = await supabase
      .from('project_media')
      .select('*')
      .in('project_id', projectIds)
      .order('display_order', { ascending: true })

    if (error || !data) return map

    for (const row of data) {
      if (!map.has(row.project_id)) map.set(row.project_id, [])
      map.get(row.project_id).push(row)
    }
  } catch {
    // project_media table not available yet (migration not run) — safe no-op.
  }
  return map
}

/** Builds a single-item media array from a project's legacy image_url, for
 *  projects that predate the media table (fallback projects, or Supabase
 *  projects created before this migration was applied). */
export function legacyMediaFor(project) {
  if (!project.image_url) return []
  return [
    {
      id: `${project.id}-legacy-cover`,
      project_id: project.id,
      media_type: 'image',
      storage_path: project.image_path || null,
      public_url: project.image_url,
      caption: null,
      display_order: 0,
    },
  ]
}

/** Resolves what a project card / hero should show as its cover. */
export function getCoverMedia(project) {
  const media = project.media && project.media.length > 0 ? project.media : legacyMediaFor(project)
  const sorted = [...media].sort((a, b) => a.display_order - b.display_order)
  const firstImage = sorted.find((item) => item.media_type === 'image')
  if (firstImage) return { type: 'image', url: firstImage.public_url }
  if (sorted.some((item) => item.media_type === 'video')) return { type: 'placeholder' }
  return { type: 'image', url: project.image_url }
}

export async function adminListProjectMedia(projectId) {
  requireSupabase()
  const { data, error } = await supabase
    .from('project_media')
    .select('*')
    .eq('project_id', projectId)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function adminAddProjectMedia({ projectId, mediaType, storagePath, publicUrl, caption, displayOrder }) {
  requireSupabase()
  const { data, error } = await supabase
    .from('project_media')
    .insert({
      project_id: projectId,
      media_type: mediaType,
      storage_path: storagePath,
      public_url: publicUrl,
      caption: caption || null,
      display_order: displayOrder ?? 0,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminUpdateProjectMedia(id, updates) {
  requireSupabase()
  const { data, error } = await supabase.from('project_media').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function adminDeleteProjectMedia(media) {
  requireSupabase()
  const bucket = MEDIA_LIMITS[media.media_type]?.bucket
  if (bucket && media.storage_path) {
    await supabase.storage.from(bucket).remove([media.storage_path])
  }
  const { error } = await supabase.from('project_media').delete().eq('id', media.id)
  if (error) throw error
}

/** Removes every stored file (images + videos) attached to a project. Safe
 *  no-op if project_media doesn't exist yet. Called before deleting a project
 *  so storage doesn't accumulate orphaned files. */
export async function adminDeleteAllProjectMedia(projectId) {
  if (!isSupabaseConfigured || !supabase) return
  try {
    const { data } = await supabase.from('project_media').select('storage_path, media_type').eq('project_id', projectId)
    if (!data || data.length === 0) return

    const imagePaths = data.filter((m) => m.media_type === 'image' && m.storage_path).map((m) => m.storage_path)
    const videoPaths = data.filter((m) => m.media_type === 'video' && m.storage_path).map((m) => m.storage_path)

    if (imagePaths.length) await supabase.storage.from('project-images').remove(imagePaths)
    if (videoPaths.length) await supabase.storage.from('project-videos').remove(videoPaths)
  } catch {
    // project_media table not available yet — nothing to clean up.
  }
}
