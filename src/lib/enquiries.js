import { supabase, isSupabaseConfigured } from './supabaseClient'

/**
 * Submits a contact/quote/booking enquiry. When Supabase is not configured
 * (e.g. an unconfigured local/dev environment), the enquiry is not persisted
 * anywhere, but we still resolve successfully so the public form always
 * shows a clean confirmation instead of a broken/erroring experience. Once
 * Supabase is configured, a real failure here always throws — the caller
 * must show a genuine error, never a fake success.
 */
export async function submitEnquiry(enquiry) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured — enquiry was not saved.')
    return { saved: false }
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
