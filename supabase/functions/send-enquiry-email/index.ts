// Supabase Edge Function — sends a business notification email, and (if the
// customer supplied an email address) a customer confirmation email,
// whenever a new row is inserted into public.enquiries.
//
// NOT ACTIVE YET. This function is prepared but not deployed or wired to a
// Database Webhook. See README.md, "Email Notification System" section, for
// the exact activation steps once napeandsonsplumbing.co.za is verified.
//
// Trigger (once configured): a Supabase Database Webhook on
// public.enquiries, event INSERT, calling this function's URL. Supabase
// webhooks POST a payload shaped like:
//   { type: "INSERT", table: "enquiries", schema: "public", record: {...} }
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
// Supabase by the time this function runs at all (the webhook fires after
// the insert commits), so nothing here can ever lose a customer enquiry —
// worst case, no email goes out and the failure is logged for diagnosis.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildBusinessEmail, buildCustomerEmail, type EnquiryRecord } from './templates.ts'
import { sendEmail, isEmailProviderConfigured } from './email-provider.ts'

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

  // Idempotency guard against duplicate webhook deliveries for the same
  // row. Requires the optional notification_sent_at column — see
  // supabase/migrations/007_enquiry_notification_tracking.sql. Safe no-op
  // if that column doesn't exist yet: it will simply be undefined here.
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
    // non-2xx status so Supabase's built-in webhook retry (a small number
    // of attempts with backoff) can retry transient provider failures,
    // rather than building custom retry logic here.
    //
    // Tradeoff: on retry, whichever email already succeeded (business or
    // customer) may be sent a second time. Accepted for simplicity — if
    // duplicate emails become a real problem in practice, track business
    // and customer notification status as two separate columns instead of
    // this single notification_sent_at timestamp.
    return new Response(JSON.stringify({ businessOk, customerOk }), { status: 502 })
  }

  if (SUPABASE_URL && SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
      await supabase.from('enquiries').update({ notification_sent_at: new Date().toISOString() }).eq('id', enquiry.id)
    } catch (error) {
      // Non-fatal: worst case a future duplicate webhook delivery re-sends
      // these emails once more.
      console.error('send-enquiry-email: could not mark notification_sent_at', error)
    }
  }

  return new Response(JSON.stringify({ businessOk, customerOk }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
