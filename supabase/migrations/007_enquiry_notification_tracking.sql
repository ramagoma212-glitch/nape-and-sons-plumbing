-- Nape and Sons Plumbing & Projects — Migration 007 (optional)
--
-- Supports the prepared-but-not-yet-active email notification system
-- (supabase/functions/send-enquiry-email). Adds a nullable
-- notification_sent_at timestamp so that function can tell whether an
-- enquiry has already triggered its notification emails — protecting
-- against duplicate sends if the Database Webhook that will eventually
-- call it ever retries delivery for the same row.
--
-- This is entirely optional infrastructure for a system that is not active
-- yet. You do NOT need to run this now — nothing currently depends on it.
-- Run it only when you're ready to configure the Database Webhook described
-- in README.md, "Email Notification System" (before or alongside that
-- step, not after).
--
-- Purely additive: does not touch RLS, existing data, or any current
-- functionality. Existing rows simply get notification_sent_at = null.
--
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)
-- when you're ready to activate email notifications.

alter table public.enquiries add column if not exists notification_sent_at timestamptz;

create index if not exists enquiries_notification_sent_at_idx on public.enquiries (notification_sent_at);
