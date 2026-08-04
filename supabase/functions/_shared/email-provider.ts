// Resend-specific implementation, isolated in this one file so a different
// transactional email provider could be swapped in later without touching
// templates.ts or the functions that call sendEmail().
//
// The API key is read ONLY from a Supabase Edge Function secret via
// Deno.env — never from frontend code, never from a VITE_ variable, never
// committed to this repository. Configure it with:
//   supabase secrets set RESEND_API_KEY=<real-key>
// This file does not require a real key to exist for the site to build or
// run — isEmailProviderConfigured() lets callers fail safely when it's
// absent.

import type { OutgoingEmail } from './templates.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export function isEmailProviderConfigured(): boolean {
  return Boolean(RESEND_API_KEY)
}

export async function sendEmail(email: OutgoingEmail): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured.')
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: email.from,
      to: email.to,
      reply_to: email.replyTo,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  })

  if (!response.ok) {
    // The detailed provider response is logged by the caller server-side
    // only — it must never be returned to the browser/customer.
    const detail = await response.text().catch(() => '')
    throw new Error(`Resend request failed (${response.status}): ${detail.slice(0, 300)}`)
  }
}
