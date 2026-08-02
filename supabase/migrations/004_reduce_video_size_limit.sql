-- Nape and Sons Plumbing & Projects — Migration 004 (corrective)
--
-- Diagnosis: video uploads were failing. The project-videos bucket was
-- created (migration 002) with file_size_limit = 104857600 (100MB), but
-- Supabase's Free plan enforces a 50MB per-file upload ceiling at the
-- platform level regardless of a bucket's own file_size_limit — so any
-- video over ~50MB was being rejected by Supabase Storage itself, and the
-- application's client-side validation (which was also set to 100MB) was
-- letting files through that could never actually succeed.
--
-- This migration lowers the bucket's file_size_limit to 50MB to match what
-- the plan actually supports. The application's client-side validation has
-- already been updated to match (src/lib/media.js).
--
-- This does not touch RLS/storage policies — those were already correct
-- (public read, authenticated-only write) and are untouched here.
--
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

update storage.buckets
set file_size_limit = 52428800 -- 50MB
where id = 'project-videos';

-- Verification query — confirm the limit was updated.
select id, file_size_limit, allowed_mime_types, public
from storage.buckets
where id = 'project-videos';
