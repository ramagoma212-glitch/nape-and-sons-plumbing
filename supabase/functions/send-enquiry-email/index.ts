// Supabase Edge Function — sends a business notification email, and (if the
// customer supplied an email address) a customer confirmation email, for a
// given enquiry.
//
// NOT the primary send path anymore. submit-enquiry now sends notifications
// itself, synchronously, right after the database insert that creates each
// enquiry — no Database Webhook is used (Supabase's Dashboard webhook
// feature failed on this project with "schema supabase_functions does not
// exist", and hand-building that infrastructure was deliberately avoided).
//
// This function is kept as a manual-retry tool: if a specific enquiry's
// notification_sent_at is still null (submit-enquiry's own send attempt
// failed), invoke this function directly with that row's data to retry.
//
// Required secret (configure via `supabase secrets set RESEND_API_KEY=...`,
// never in frontend code, .env.local, or Netlify): RESEND_API_KEY
//
// Automatically provided to every Supabase Edge Function without manual
// configuration: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. The service-role
// key is used here ONLY inside this server-side function, purely to mark a
// row as notified — it is never returned in any response and never reaches
// the browser.
//
// Failure philosophy: the customer's enquiry is already durably saved in
// Supabase by the time this function is invoked for it, so nothing here can
// ever lose a customer enquiry — worst case, no email goes out and the
// failure is logged for diagnosis.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildBusinessEmail, buildCustomerEmail, type EnquiryRecord } from '../_shared/templates.ts'
import { sendEmail, isEmailProviderConfigured } from '../_shared/email-provider.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let payload: { record?: EnquiryRecord }
  try {
    payload = await req.json()
  } catch {
    return new Response('Invalid JSON payload', { status: 400 })
  }

  const enquiry = payload.record
  if (!enquiry || typeof enquiry.id !== 'string') {
    return new Response('Missing enquiry record in payload', { status: 400 })
  }

  // Idempotency guard: refuse to re-send for a row that's already marked
  // notified, e.g. if this is invoked manually more than once for the same
  // row by mistake.
  if ((enquiry as Record<string, unknown>).notification_sent_at) {
    return new Response('Already notified', { status: 200 })
  }

  if (!isEmailProviderConfigured()) {
    console.error(
      'send-enquiry-email: RESEND_API_KEY is not configured — enquiry is safely stored, but no email will be sent.',
    )
    return new Response('Email provider not configured', { status: 200 })
  }

  let businessOk = false
  // Not required if the customer never gave an email address.
  let customerOk = !enquiry.email

  try {
    await sendEmail(buildBusinessEmail(enquiry))
    businessOk = true
  } catch (error) {
    console.error('send-enquiry-email: business notification failed', error)
  }

  if (enquiry.email) {
    try {
      const customerEmail = buildCustomerEmail(enquiry)
      if (customerEmail) await sendEmail(customerEmail)
      customerOk = true
    } catch (error) {
      console.error('send-enquiry-email: customer confirmation failed', error)
    }
  }

  if (!businessOk || !customerOk) {
    // Deliberately not marking notification_sent_at, and returning a
    // non-2xx status, so whoever invokes this manually for a retry can see
    // it didn't fully succeed and try again later.
    //
    // Tradeoff: on a manual retry, whichever email already succeeded
    // (business or customer) may be sent a second time. Accepted for
    // simplicity — if that becomes a real problem in practice, track
    // business and customer notification status as two separate columns
    // instead of this single notification_sent_at timestamp.
    return new Response(JSON.stringify({ businessOk, customerOk }), { status: 502 })
  }

  if (SUPABASE_URL && SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
      await supabase.from('enquiries').update({ notification_sent_at: new Date().toISOString() }).eq('id', enquiry.id)
    } catch (error) {
      // Non-fatal: worst case a future manual retry re-sends these emails
      // once more.
      console.error('send-enquiry-email: could not mark notification_sent_at', error)
    }
  }

  return new Response(JSON.stringify({ businessOk, customerOk }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
