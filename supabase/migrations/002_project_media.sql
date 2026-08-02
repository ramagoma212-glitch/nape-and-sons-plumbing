-- Nape and Sons Plumbing & Projects — Migration 002
-- Adds a proper one-to-many project media architecture (multiple images +
-- videos per project) on top of the existing schema in supabase/schema.sql.
--
-- SAFE TO RUN ON A LIVE DATABASE: this migration is purely additive.
-- It does NOT drop, rename or modify the existing projects.image_url /
-- projects.image_path columns — those remain in place for backward
-- compatibility with any project that hasn't been given gallery media yet.
--
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)
-- AFTER supabase/schema.sql has already been applied.

-- ============================================================
-- PROJECT_MEDIA TABLE
-- ============================================================
create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  storage_path text not null,
  public_url text not null,
  caption text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_media_project_id_idx on public.project_media (project_id);
create index if not exists project_media_display_order_idx on public.project_media (display_order);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.project_media enable row level security;

-- Public visitors (including anonymous) can read media for the gallery.
drop policy if exists "Public can read project media" on public.project_media;
create policy "Public can read project media"
  on public.project_media
  for select
  to anon, authenticated
  using (true);

-- Only authenticated admins can attach, edit or remove media.
drop policy if exists "Authenticated can insert project media" on public.project_media;
create policy "Authenticated can insert project media"
  on public.project_media
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update project media" on public.project_media;
create policy "Authenticated can update project media"
  on public.project_media
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete project media" on public.project_media;
create policy "Authenticated can delete project media"
  on public.project_media
  for delete
  to authenticated
  using (true);

-- ============================================================
-- STORAGE BUCKET (project-videos)
-- ============================================================
-- The existing project-images bucket and its policies (see supabase/schema.sql)
-- are untouched. This adds a separate bucket for video uploads.
--
-- NOTE: file_size_limit is capped at 50MB (52428800 bytes), not higher —
-- Supabase's Free plan enforces a 50MB per-file upload ceiling at the
-- platform level regardless of what a bucket's own file_size_limit says, so
-- setting this any higher would be misleading (the client would accept a
-- file that Supabase then rejects). Raise this only alongside a paid plan
-- that actually supports larger uploads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-videos', 'project-videos', true, 52428800, array['video/mp4', 'video/webm'])
on conflict (id) do update
  set public = true,
      file_size_limit = 52428800,
      allowed_mime_types = array['video/mp4', 'video/webm'];

drop policy if exists "Public can view project videos" on storage.objects;
create policy "Public can view project videos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'project-videos');

drop policy if exists "Authenticated can upload project videos" on storage.objects;
create policy "Authenticated can upload project videos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'project-videos');

drop policy if exists "Authenticated can update project videos" on storage.objects;
create policy "Authenticated can update project videos"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'project-videos');

drop policy if exists "Authenticated can delete project videos" on storage.objects;
create policy "Authenticated can delete project videos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'project-videos');
