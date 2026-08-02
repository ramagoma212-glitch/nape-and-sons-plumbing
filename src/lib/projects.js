import { supabase, isSupabaseConfigured } from './supabaseClient'
import { fallbackProjects } from '../data/projects'
import { getProjectMediaMap, legacyMediaFor, adminDeleteAllProjectMedia } from './media'

const BUCKET = 'project-images'

function withFallbackMedia(project) {
  return { ...project, media: legacyMediaFor(project) }
}

/** Fetches all projects, preferring Supabase and falling back to local data.
 *  Each project gets a `media` array attached: real project_media rows when
 *  available, otherwise a single-item array synthesized from the legacy
 *  image_url so the rest of the app can rely on `project.media` uniformly. */
export async function getProjects() {
  if (!isSupabaseConfigured) return fallbackProjects.map(withFallbackMedia)

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })

  if (error || !data || data.length === 0) return fallbackProjects.map(withFallbackMedia)

  const mediaMap = await getProjectMediaMap(data.map((project) => project.id))
  return data.map((project) => {
    const media = mediaMap.get(project.id)
    return { ...project, media: media && media.length > 0 ? media : legacyMediaFor(project) }
  })
}

export async function getProjectBySlug(slug) {
  const projects = await getProjects()
  return projects.find((project) => project.slug === slug) || null
}

export async function getFeaturedProjects(limit = 6) {
  const projects = await getProjects()
  const featured = projects.filter((project) => project.featured)
  return (featured.length > 0 ? featured : projects).slice(0, limit)
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Admin features require environment variables.')
  }
}

export async function adminListProjects() {
  requireSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function adminCreateProject(project) {
  requireSupabase()
  const { data, error } = await supabase.from('projects').insert(project).select().single()
  if (error) throw error
  return data
}

export async function adminUpdateProject(id, updates) {
  requireSupabase()
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminDeleteProject(id, imagePath) {
  requireSupabase()
  // Clean up gallery media (images + videos) first — the project_media rows
  // themselves cascade-delete with the project, but their storage objects
  // don't, so they'd otherwise be left behind as orphaned files.
  await adminDeleteAllProjectMedia(id)
  if (imagePath) {
    await supabase.storage.from(BUCKET).remove([imagePath])
  }
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function adminUploadProjectImage(file) {
  requireSupabase()
  const extension = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { path, url: data.publicUrl }
}

export async function adminReplaceProjectImage(file, previousPath) {
  const uploaded = await adminUploadProjectImage(file)
  if (previousPath) {
    await supabase.storage.from(BUCKET).remove([previousPath])
  }
  return uploaded
}
