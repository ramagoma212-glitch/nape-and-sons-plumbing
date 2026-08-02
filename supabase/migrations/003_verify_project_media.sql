-- Nape and Sons Plumbing & Projects — Migration 003 (corrective)
--
-- Diagnosis: querying public.project_media against the live production
-- database returns PostgREST error PGRST205 ("Could not find the table
-- 'public.project_media' in the schema cache") — the table was never
-- actually created. The project-videos storage bucket from the same
-- 002_project_media.sql migration DOES exist, so only the table + its
-- policies from that migration did not take effect.
--
-- This file re-asserts ONLY the missing piece (the table, its indexes and
-- its RLS policies) using the same idempotent statements as migration 002.
-- It does not touch storage.buckets/storage.objects, since project-videos
-- already exists and is untouched by this file.
--
-- Safe to run even if some of this partially exists already.
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

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

alter table public.project_media enable row level security;

drop policy if exists "Public can read project media" on public.project_media;
create policy "Public can read project media"
  on public.project_media
  for select
  to anon, authenticated
  using (true);

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

-- Verification query — run this after the statements above to confirm the
-- table is visible to PostgREST. It should return zero rows, not an error.
select * from public.project_media limit 1;
