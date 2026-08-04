// Supabase Edge Function — the ONLY server-side path that may write to
// public.enquiries now that supabase/migrations/008_secure_enquiry_submission.sql
// has been applied.
//
// Flow: request shape/field validation -> Cloudflare Turnstile siteverify
// -> insert into public.enquiries using the service role key (bypasses
// RLS) -> business email notification -> mark notification_sent_at ->
// customer acknowledgement (if an email was supplied). The honeypot is
// consulted only as a fallback when Turnstile fails — see the comment
// above that check for why.
//
// Email is sent synchronously, in-process, right here — not via a
// Database Webhook. Supabase's Dashboard webhook feature failed on this
// project ("schema supabase_functions does not exist"), and hand-building
// that infrastructure (pg_net trigger, custom http_request function) was
// deliberately avoided rather than reverse-engineering an unsupported
// substitute on production. This is simpler anyway: the row we just
// inserted is already in memory, so there's nothing to look up and no
// separate retry/duplicate-delivery model to guard against.
//
// Email is strictly best-effort and can never affect the customer-facing
// result: the row is already durably saved by the time any email code
// runs, and every email-related step below is wrapped so a failure there
// only ever affects logging and notification_sent_at, never the response
// or the row itself. supabase/functions/send-enquiry-email remains
// available as a manual retry tool for a specific row whose
// notification_sent_at is still null.
//
// Required secrets (configure via `supabase secrets set NAME=...`, never
// in frontend code, .env.local, or Netlify):
//   TURNSTILE_SECRET_KEY
//   RESEND_API_KEY
//
// Automatically provided to every Supabase Edge Function without manual
// configuration: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. The service-role
// key is used here ONLY inside this server-side function to perform the
// insert and the notification_sent_at update — it is never returned in
// any response and never reaches the browser.
//
// Privacy: nothing logged below includes full_name, phone, email, message,
// or the Turnstile token. Only generic reason codes, Cloudflare's own
// error codes, and Postgres error codes are logged, for diagnosis without
// exposing customer data.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'
import { validateEnquiry } from './validation.ts'
import { verifyTurnstileToken } from './turnstile.ts'
import { buildBusinessEmail, buildCustomerEmail, type EnquiryRecord } from '../_shared/templates.ts'
import { sendEmail, isEmailProviderConfigured } from '../_shared/email-provider.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

function jsonResponse(body: Record<string, unknown>, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, reason: 'method' }, 405, origin)
  }

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return jsonResponse({ ok: false, reason: 'validation' }, 400, origin)
  }

  const validated = validateEnquiry(rawBody)
  if (!validated.ok) {
    console.warn('submit-enquiry: rejected invalid payload', validated.reason)
    return jsonResponse({ ok: false, reason: 'validation' }, 400, origin)
  }

  const enquiry = validated.value
  const honeypotFilled = Boolean(enquiry.company && enquiry.company.trim().length > 0)

  // Turnstile is checked FIRST and is the authoritative signal — a filled
  // honeypot alone no longer rejects anything. Real visitors can have this
  // hidden field silently populated by browser autofill, so a passing
  // Turnstile result must never be silently discarded just because the
  // honeypot also has a value. See git history for the incident this
  // addressed.
  const remoteIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const turnstileResult = await verifyTurnstileToken(enquiry.turnstileToken as string, remoteIp)
  if (!turnstileResult.ok) {
    // Turnstile did not pass. If the honeypot is ALSO filled, this matches
    // a simple bot closely enough to respond with a fake success and skip
    // the insert, exactly as before — bots get no signal anything was
    // rejected. If the honeypot is empty, this is very likely a genuine
    // visitor whose verification genuinely failed or expired, so they get
    // the real customer-facing error instead, never a silent fake success.
    if (honeypotFilled) {
      return jsonResponse({ ok: true }, 200, origin)
    }
    return jsonResponse({ ok: false, reason: 'turnstile' }, 403, origin)
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('submit-enquiry: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return jsonResponse({ ok: false, reason: 'server' }, 500, origin)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const { data: inserted, error } = await supabase
    .from('enquiries')
    .insert({
      full_name: enquiry.fullName,
      phone: enquiry.phone,
      email: enquiry.email,
      service: enquiry.service,
      location: enquiry.location,
      message: enquiry.message,
      enquiry_type: enquiry.enquiryType,
      preferred_date: enquiry.preferredDate,
      preferred_time: enquiry.preferredTime,
      status: 'new',
    })
    .select()
    .single()

  if (error || !inserted) {
    // Postgres error details stay server-side only.
    console.error('submit-enquiry: insert failed', error?.code)
    return jsonResponse({ ok: false, reason: 'server' }, 500, origin)
  }

  // From here on the enquiry is durably saved — nothing below can ever
  // lose it or roll it back. Email is best-effort only.
  if (isEmailProviderConfigured()) {
    let businessOk = false
    try {
      await sendEmail(buildBusinessEmail(inserted as EnquiryRecord))
      businessOk = true
    } catch (businessError) {
      console.error('submit-enquiry: business notification failed', businessError)
    }

    if (businessOk) {
      // Only mark notified after the business email actually succeeded —
      // if this update itself fails, notification_sent_at correctly stays
      // null and send-enquiry-email can be used to retry this row later.
      try {
        await supabase
          .from('enquiries')
          .update({ notification_sent_at: new Date().toISOString() })
          .eq('id', inserted.id)
      } catch (updateError) {
        console.error('submit-enquiry: could not mark notification_sent_at', updateError)
      }

      const customerEmail = buildCustomerEmail(inserted as EnquiryRecord)
      if (customerEmail) {
        try {
          await sendEmail(customerEmail)
        } catch (customerError) {
          // The business notification already succeeded and is already
          // marked — a failed acknowledgement here is logged only and
          // never affects the row or the response.
          console.error('submit-enquiry: customer acknowledgement failed', customerError)
        }
      }
    }
  } else {
    console.error('submit-enquiry: RESEND_API_KEY is not configured — enquiry saved, no email sent')
  }

  return jsonResponse({ ok: true }, 200, origin)
})
