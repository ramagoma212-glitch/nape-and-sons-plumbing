// Server-side Cloudflare Turnstile verification.
//
// Required secret (configure via `supabase secrets set TURNSTILE_SECRET_KEY=...`,
// never in frontend code, .env.local, or Netlify): TURNSTILE_SECRET_KEY
//
// Cloudflare publishes fixed dummy sitekey/secret pairs for testing, which
// this function fully supports without any code changes — see README.md,
// "Turnstile Anti-Spam" section, for the exact values and what each one is
// for. Nothing below is specific to real production credentials.

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

// The production hostname this widget is ultimately configured for, plus
// the local hostnames used during development/testing. Cloudflare returns
// the hostname the widget was solved on, so checking it here stops a token
// solved on a different site from being replayed against this endpoint.
const ALLOWED_HOSTNAMES = new Set(['napeandsonsplumbing.co.za', 'localhost', '127.0.0.1'])

// The frontend widget is configured with data-action="submit_enquiry" once
// deployed. Older/test tokens may not carry an action at all, so this is
// checked only when Cloudflare actually returns one.
const EXPECTED_ACTION = 'submit_enquiry'

export type TurnstileResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'network_error' | 'rejected' }

interface SiteverifyResponse {
  success: boolean
  hostname?: string
  action?: string
  'error-codes'?: string[]
}

export async function verifyTurnstileToken(token: string, remoteIp: string | null): Promise<TurnstileResult> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
  // Fail closed: an unconfigured secret must never be treated as an implicit
  // pass. This is the one case where the caller-facing message can't be the
  // usual "verification failed" — it's a deployment problem, not a visitor
  // problem — but it must still be reported as a generic server error.
  if (!secret) {
    console.error('submit-enquiry: TURNSTILE_SECRET_KEY is not configured')
    return { ok: false, reason: 'not_configured' }
  }

  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (remoteIp) form.append('remoteip', remoteIp)

  let data: SiteverifyResponse
  try {
    const response = await fetch(SITEVERIFY_URL, { method: 'POST', body: form })
    data = await response.json()
  } catch (error) {
    console.error('submit-enquiry: siteverify request failed', error)
    return { ok: false, reason: 'network_error' }
  }

  if (!data.success) {
    // Safe to log server-side: Cloudflare's own error codes (e.g.
    // "timeout-or-duplicate", "invalid-input-response"), never customer PII.
    console.warn('submit-enquiry: turnstile rejected token', data['error-codes'])
    return { ok: false, reason: 'rejected' }
  }

  if (data.hostname && !ALLOWED_HOSTNAMES.has(data.hostname)) {
    console.warn('submit-enquiry: turnstile hostname mismatch', data.hostname)
    return { ok: false, reason: 'rejected' }
  }

  if (data.action && data.action !== EXPECTED_ACTION) {
    console.warn('submit-enquiry: turnstile action mismatch', data.action)
    return { ok: false, reason: 'rejected' }
  }

  return { ok: true }
}
