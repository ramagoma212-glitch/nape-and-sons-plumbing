-- Nape and Sons Plumbing & Projects — Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  category text not null,
  image_url text not null,
  image_path text,
  alt text,
  featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_display_order_idx on public.projects (display_order);
create index if not exists projects_category_idx on public.projects (category);

-- Keep updated_at current on every row update.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- ENQUIRIES TABLE (contact / quote requests)
-- ============================================================
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  service text not null,
  location text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists enquiries_status_idx on public.enquiries (status);
create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.projects enable row level security;
alter table public.enquiries enable row level security;

-- Projects: anyone (including anonymous visitors) can read.
drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects"
  on public.projects
  for select
  to anon, authenticated
  using (true);

-- Projects: only authenticated (admin) users can create/update/delete.
drop policy if exists "Authenticated can insert projects" on public.projects;
create policy "Authenticated can insert projects"
  on public.projects
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update projects" on public.projects;
create policy "Authenticated can update projects"
  on public.projects
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete projects" on public.projects;
create policy "Authenticated can delete projects"
  on public.projects
  for delete
  to authenticated
  using (true);

-- Enquiries: public visitors may INSERT (submit the contact form) but never read.
drop policy if exists "Public can submit enquiries" on public.enquiries;
create policy "Public can submit enquiries"
  on public.enquiries
  for insert
  to anon, authenticated
  with check (true);

-- Enquiries: only authenticated (admin) users can read/update/delete.
drop policy if exists "Authenticated can read enquiries" on public.enquiries;
create policy "Authenticated can read enquiries"
  on public.enquiries
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can update enquiries" on public.enquiries;
create policy "Authenticated can update enquiries"
  on public.enquiries
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete enquiries" on public.enquiries;
create policy "Authenticated can delete enquiries"
  on public.enquiries
  for delete
  to authenticated
  using (true);

-- ============================================================
-- STORAGE BUCKET (project-images)
-- ============================================================
-- Run this section too — it creates the bucket and its policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Public can view project images" on storage.objects;
create policy "Public can view project images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'project-images');

drop policy if exists "Authenticated can upload project images" on storage.objects;
create policy "Authenticated can upload project images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'project-images');

drop policy if exists "Authenticated can update project images" on storage.objects;
create policy "Authenticated can update project images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'project-images');

drop policy if exists "Authenticated can delete project images" on storage.objects;
create policy "Authenticated can delete project images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'project-images');
