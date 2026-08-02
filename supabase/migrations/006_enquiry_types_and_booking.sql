-- Nape and Sons Plumbing & Projects — Migration 006
-- Adds enquiry types (contact / quote / booking) and booking fields to the
-- existing enquiries table, plus defense-in-depth length constraints.
--
-- Purely additive: no existing columns, rows or RLS policies are touched or
-- removed. Existing rows automatically get enquiry_type = 'quote' via the
-- column default. Existing RLS (public insert-only, authenticated-only
-- read/update/delete) already covers the new columns with no changes needed,
-- since the policies use `using (true)` / `with check (true)` rather than
-- referencing specific columns.
--
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

-- ============================================================
-- ENQUIRY TYPE
-- ============================================================
alter table public.enquiries add column if not exists enquiry_type text not null default 'quote';

alter table public.enquiries drop constraint if exists enquiries_enquiry_type_check;
alter table public.enquiries add constraint enquiries_enquiry_type_check
  check (enquiry_type in ('contact', 'quote', 'booking'));

create index if not exists enquiries_enquiry_type_idx on public.enquiries (enquiry_type);

-- ============================================================
-- BOOKING FIELDS
-- ============================================================
alter table public.enquiries add column if not exists preferred_date date;
alter table public.enquiries add column if not exists preferred_time text;

-- A booking request must include a preferred date. This only checks
-- presence (not that the date is in the future), so it stays valid on
-- later admin updates to an old row even after that date has passed —
-- "must not be in the past" is enforced at submission time in the UI
-- instead, where it belongs.
alter table public.enquiries drop constraint if exists enquiries_booking_requires_date;
alter table public.enquiries add constraint enquiries_booking_requires_date
  check (enquiry_type <> 'booking' or preferred_date is not null);

-- ============================================================
-- DEFENSE-IN-DEPTH LENGTH CONSTRAINTS
-- ============================================================
-- Generous limits chosen to never reject normal South African customer
-- input — these exist only to stop abusive/garbage payloads sent directly
-- to the API, bypassing the frontend's own validation.
alter table public.enquiries drop constraint if exists enquiries_full_name_length;
alter table public.enquiries add constraint enquiries_full_name_length
  check (char_length(full_name) between 1 and 150);

alter table public.enquiries drop constraint if exists enquiries_phone_length;
alter table public.enquiries add constraint enquiries_phone_length
  check (char_length(phone) between 1 and 30);

alter table public.enquiries drop constraint if exists enquiries_email_length;
alter table public.enquiries add constraint enquiries_email_length
  check (email is null or char_length(email) <= 255);

alter table public.enquiries drop constraint if exists enquiries_service_length;
alter table public.enquiries add constraint enquiries_service_length
  check (char_length(service) between 1 and 100);

alter table public.enquiries drop constraint if exists enquiries_location_length;
alter table public.enquiries add constraint enquiries_location_length
  check (char_length(location) between 1 and 150);

alter table public.enquiries drop constraint if exists enquiries_message_length;
alter table public.enquiries add constraint enquiries_message_length
  check (char_length(message) between 1 and 3000);

alter table public.enquiries drop constraint if exists enquiries_preferred_time_length;
alter table public.enquiries add constraint enquiries_preferred_time_length
  check (preferred_time is null or char_length(preferred_time) <= 50);

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Confirm the new columns and constraints are in place.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'enquiries'
order by ordinal_position;
