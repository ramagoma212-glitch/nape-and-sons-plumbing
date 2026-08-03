// Supabase Edge Function — the ONLY server-side path that may write to
// public.enquiries once supabase/migrations/008_secure_enquiry_submission.sql
// has been run. Until that migration runs, this function and the legacy
// anonymous direct-insert path are both valid simultaneously, which is what
// makes a zero-downtime cutover possible — see README.md, "Turnstile
// Anti-Spam", "Activation sequence".
//
// Flow: honeypot check -> request shape/field validation -> Cloudflare
// Turnstile siteverify -> insert into public.enquiries using the service
// role key (bypasses RLS, so this keeps working whether or not the
// anonymous insert policy still exists).
//
// Required secret (configure via `supabase secrets set TURNSTILE_SECRET_KEY=...`,
// never in frontend code, .env.local, or Netlify): TURNSTILE_SECRET_KEY
//
// Automatically provided to every Supabase Edge Function without manual
// configuration: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. The service-role
// key is used here ONLY inside this server-side function to perform the
// insert — it is never returned in any response and never reaches the
// browser.
//
// Privacy: nothing logged below includes full_name, phone, email, message,
// or the Turnstile token itself. Only generic reason codes and Cloudflare's
// own error codes are logged, for diagnosis without exposing customer data.
//
// This function inserts into the SAME public.enquiries table the prepared
// (not yet active) send-enquiry-email webhook watches — it does not call
// Resend directly and does not know that system exists, keeping the two
// concerns fully separated.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'
import { validateEnquiry } from './validation.ts'
import { verifyTurnstileToken } from './turnstile.ts'

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

  // Honeypot: a filled hidden field means this wasn't a real visitor.
  // Respond exactly as if it succeeded, without verifying Turnstile or
  // touching the database, so bots get no signal that anything was
  // rejected.
  if (enquiry.company && enquiry.company.trim().length > 0) {
    return jsonResponse({ ok: true }, 200, origin)
  }

  const remoteIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const turnstileResult = await verifyTurnstileToken(enquiry.turnstileToken as string, remoteIp)
  if (!turnstileResult.ok) {
    return jsonResponse({ ok: false, reason: 'turnstile' }, 403, origin)
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('submit-enquiry: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return jsonResponse({ ok: false, reason: 'server' }, 500, origin)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const { error } = await supabase.from('enquiries').insert({
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

  if (error) {
    // Postgres error details stay server-side only.
    console.error('submit-enquiry: insert failed', error.code)
    return jsonResponse({ ok: false, reason: 'server' }, 500, origin)
  }

  return jsonResponse({ ok: true }, 200, origin)
})
