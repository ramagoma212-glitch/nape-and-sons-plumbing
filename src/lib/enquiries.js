import { supabase, isSupabaseConfigured } from './supabaseClient'

// Whether the secure Turnstile submission path is active. This is the
// single switch that decides how submitEnquiry behaves — see
// README.md, "Turnstile Anti-Spam", for the full activation sequence.
// Until VITE_TURNSTILE_SITE_KEY is set in the build environment, this stays
// false and every form keeps working exactly as it does in production
// today (direct insert, honeypot only). Setting it in Netlify is what
// switches the frontend over to calling submit-enquiry — no separate code
// deploy is needed to flip it on.
export const isTurnstileConfigured = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY)

const TURNSTILE_ERROR_MESSAGES = {
  turnstile: 'Please complete the security check and try again.',
  validation: 'We could not send your enquiry. Please try again.',
  server: 'We could not send your enquiry. Please try again.',
}

/**
 * Submits a contact/quote/booking enquiry. When Supabase is not configured
 * (e.g. an unconfigured local/dev environment), the enquiry is not persisted
 * anywhere, but we still resolve successfully so the public form always
 * shows a clean confirmation instead of a broken/erroring experience. Once
 * Supabase is configured, a real failure here always throws — the caller
 * must show a genuine error, never a fake success.
 *
 * When Turnstile is configured, submission goes through the submit-enquiry
 * Edge Function instead of a direct table insert, so the browser can no
 * longer create a row without passing server-side verification.
 */
export async function submitEnquiry(enquiry) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured — enquiry was not saved.')
    return { saved: false }
  }

  if (isTurnstileConfigured) {
    const { data, error } = await supabase.functions.invoke('submit-enquiry', {
      body: {
        enquiryType: enquiry.enquiryType || 'quote',
        fullName: enquiry.fullName,
        phone: enquiry.phone,
        email: enquiry.email || null,
        service: enquiry.service,
        location: enquiry.location,
        message: enquiry.message,
        preferredDate: enquiry.preferredDate || null,
        preferredTime: enquiry.preferredTime || null,
        turnstileToken: enquiry.turnstileToken,
        company: enquiry.company || '',
      },
    })

    if (error || !data?.ok) {
      const reason = data?.reason || 'server'
      const message = TURNSTILE_ERROR_MESSAGES[reason] || TURNSTILE_ERROR_MESSAGES.server
      throw new Error(message, { cause: reason })
    }

    return { saved: true }
  }

  const { error } = await supabase.from('enquiries').insert({
    full_name: enquiry.fullName,
    phone: enquiry.phone,
    email: enquiry.email || null,
    service: enquiry.service,
    location: enquiry.location,
    message: enquiry.message,
    enquiry_type: enquiry.enquiryType || 'quote',
    preferred_date: enquiry.preferredDate || null,
    preferred_time: enquiry.preferredTime || null,
    status: 'new',
  })

  if (error) throw error
  return { saved: true }
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Admin features require environment variables.')
  }
}

export async function adminListEnquiries() {
  requireSupabase()
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function adminUpdateEnquiryStatus(id, status) {
  requireSupabase()
  const { data, error } = await supabase
    .from('enquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminDeleteEnquiry(id) {
  requireSupabase()
  const { error } = await supabase.from('enquiries').delete().eq('id', id)
  if (error) throw error
}
