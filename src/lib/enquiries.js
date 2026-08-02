import { supabase, isSupabaseConfigured } from './supabaseClient'

/**
 * Submits a contact/quote enquiry. When Supabase is not configured (e.g. the
 * initial client demo), the enquiry is not persisted anywhere, but we still
 * resolve successfully so the public form always shows a clean confirmation
 * instead of a broken/erroring experience.
 */
export async function submitEnquiry(enquiry) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured — enquiry was not saved:', enquiry)
    return { saved: false }
  }

  const { error } = await supabase.from('enquiries').insert({
    full_name: enquiry.fullName,
    phone: enquiry.phone,
    email: enquiry.email,
    service: enquiry.service,
    location: enquiry.location,
    message: enquiry.message,
    status: 'new',
  })

  if (error) throw error
  return { saved: true }
}
