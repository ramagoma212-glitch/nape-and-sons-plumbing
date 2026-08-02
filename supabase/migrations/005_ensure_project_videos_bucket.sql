-- Nape and Sons Plumbing & Projects — Migration 005 (corrective)
--
-- Diagnosis: a real authenticated video upload attempt returned
-- "StorageApiError: Bucket not found" for project-videos. This is
-- authoritative: the bucket row in storage.buckets was never actually
-- created, despite migration 002 containing an insert statement for it.
-- (Migration 004's later `update ... where id = 'project-videos'` would
-- have silently affected zero rows if the bucket didn't exist — no error,
-- no bucket created — which is consistent with what we're seeing.)
--
-- This migration is fully self-contained: it creates the bucket if missing,
-- and (re)asserts its policies, so it doesn't matter which parts of the
-- earlier migrations did or didn't take effect. Safe to run multiple times.
--
-- IMPORTANT: run this entire file, top to bottom, in one go — do not run a
-- partial selection of it.
--
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

-- ============================================================
-- BUCKET
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-videos', 'project-videos', true, 52428800, array['video/mp4', 'video/webm'])
on conflict (id) do update
  set public = true,
      file_size_limit = 52428800,
      allowed_mime_types = array['video/mp4', 'video/webm'];

-- ============================================================
-- STORAGE POLICIES
-- ============================================================
-- Public/anonymous: read only.
drop policy if exists "Public can view project videos" on storage.objects;
create policy "Public can view project videos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'project-videos');

-- Authenticated admins only: upload.
drop policy if exists "Authenticated can upload project videos" on storage.objects;
create policy "Authenticated can upload project videos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'project-videos');

-- Authenticated admins only: replace/update.
drop policy if exists "Authenticated can update project videos" on storage.objects;
create policy "Authenticated can update project videos"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'project-videos');

-- Authenticated admins only: delete.
drop policy if exists "Authenticated can delete project videos" on storage.objects;
create policy "Authenticated can delete project videos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'project-videos');

-- ============================================================
-- VERIFICATION
-- ============================================================
-- This must return exactly one row: project-videos, public = true,
-- file_size_limit = 52428800, allowed_mime_types = {video/mp4,video/webm}.
-- If this returns zero rows, the insert above did not run — re-run this
-- entire file top to bottom rather than a partial selection.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'project-videos';
