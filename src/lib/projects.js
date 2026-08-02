import { supabase, isSupabaseConfigured } from './supabaseClient'
import { fallbackProjects } from '../data/projects'

const BUCKET = 'project-images'

/** Fetches all projects, preferring Supabase and falling back to local data. */
export async function getProjects() {
  if (!isSupabaseConfigured) return fallbackProjects

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })

  if (error || !data || data.length === 0) return fallbackProjects
  return data
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
