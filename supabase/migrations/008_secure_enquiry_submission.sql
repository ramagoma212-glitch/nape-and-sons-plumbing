-- Nape and Sons Plumbing & Projects — Migration 008 (prepared, NOT run yet)
--
-- Removes the anonymous/public direct-INSERT policy on public.enquiries.
-- Once this runs, the only way to create a row is via the
-- supabase/functions/submit-enquiry Edge Function, which validates the
-- request server-side, verifies Cloudflare Turnstile, and inserts using the
-- service-role key (which bypasses RLS entirely and is unaffected by the
-- policy change below).
--
-- DO NOT RUN THIS until submit-enquiry has been deployed, given a real
-- TURNSTILE_SECRET_KEY, tested end-to-end, and the frontend has been
-- confirmed to submit through it successfully. Running this first would
-- break the Contact/Quote/Booking forms, since they would still be trying
-- to insert directly. See README.md, "Turnstile Anti-Spam", "Activation
-- sequence", for the exact order of steps.
--
-- Purely additive/restrictive: no columns, existing rows, or the
-- authenticated (admin) read/update/delete policies are touched. Run this
-- in the Supabase SQL editor (Project > SQL Editor > New query) only when
-- you are ready.

drop policy if exists "Public can submit enquiries" on public.enquiries;

-- Deliberately no replacement INSERT policy for anon/authenticated is
-- created. From this point on, public.enquiries has zero INSERT policies —
-- the table is effectively insert-locked for every role except
-- service_role, which bypasses RLS by design and is used exclusively
-- inside submit-enquiry. Admin SELECT/UPDATE/DELETE policies (created in
-- schema.sql) are untouched by this migration and continue to work exactly
-- as before.

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Confirm only the admin read/update/delete policies remain on enquiries.
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'enquiries'
order by policyname;
