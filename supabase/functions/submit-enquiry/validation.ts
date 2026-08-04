// Server-side request validation for submit-enquiry.
//
// Mirrors the constraints already enforced in the database
// (supabase/migrations/006_enquiry_types_and_booking.sql) so bad payloads
// are rejected with a clean, generic error here instead of surfacing a raw
// Postgres constraint violation to the caller. The database constraints
// remain the ultimate source of truth and are left exactly as they are.

export interface EnquiryInput {
  enquiryType: string
  fullName: string
  phone: string
  email?: string | null
  service: string
  location: string
  message: string
  preferredDate?: string | null
  preferredTime?: string | null
  turnstileToken?: string
  company?: string // honeypot — should always be empty for a real visitor
}

const ENQUIRY_TYPES = ['contact', 'quote', 'booking']

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

/**
 * Returns null when the payload is valid, or a generic reason code when it
 * is not. The reason code is safe to log server-side but is never detailed
 * enough to leak into a customer-facing message.
 */
export function validateEnquiry(body: unknown): { ok: true; value: EnquiryInput } | { ok: false; reason: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, reason: 'missing_body' }
  }

  const input = body as Record<string, unknown>

  // The honeypot no longer short-circuits validation here. A filled
  // honeypot is no longer proof of a bot on its own — real visitors can
  // have this hidden field silently populated by browser autofill — so
  // every submission is validated normally regardless of it, and the
  // actual honeypot value is carried through (see `company` below) for
  // index.ts to weigh only AFTER Turnstile has been checked, where a
  // passing Turnstile result is treated as the stronger signal.

  if (!isNonEmptyString(input.enquiryType, 20) || !ENQUIRY_TYPES.includes(input.enquiryType as string)) {
    return { ok: false, reason: 'invalid_enquiry_type' }
  }
  if (!isNonEmptyString(input.fullName, 150)) return { ok: false, reason: 'invalid_full_name' }
  if (!isNonEmptyString(input.phone, 30)) return { ok: false, reason: 'invalid_phone' }
  if (input.email !== undefined && input.email !== null && input.email !== '') {
    if (typeof input.email !== 'string' || input.email.length > 255 || !EMAIL_PATTERN.test(input.email.trim())) {
      return { ok: false, reason: 'invalid_email' }
    }
  }
  if (!isNonEmptyString(input.service, 100)) return { ok: false, reason: 'invalid_service' }
  if (!isNonEmptyString(input.location, 150)) return { ok: false, reason: 'invalid_location' }
  if (!isNonEmptyString(input.message, 3000)) return { ok: false, reason: 'invalid_message' }

  if (input.enquiryType === 'booking') {
    if (typeof input.preferredDate !== 'string' || !DATE_PATTERN.test(input.preferredDate)) {
      return { ok: false, reason: 'invalid_preferred_date' }
    }
    // Compare as plain ISO date strings (both are YYYY-MM-DD) — no timezone
    // conversion needed and none of the surrounding subtlety it would add.
    const today = new Date().toISOString().slice(0, 10)
    if (input.preferredDate < today) {
      return { ok: false, reason: 'preferred_date_in_past' }
    }
    if (typeof input.preferredTime !== 'string' || input.preferredTime.trim().length === 0 || input.preferredTime.length > 50) {
      return { ok: false, reason: 'invalid_preferred_time' }
    }
  }

  if (!isNonEmptyString(input.turnstileToken, 2048)) {
    return { ok: false, reason: 'missing_turnstile_token' }
  }

  return {
    ok: true,
    value: {
      enquiryType: input.enquiryType as string,
      fullName: (input.fullName as string).trim(),
      phone: (input.phone as string).trim(),
      email: input.email ? (input.email as string).trim() : null,
      service: (input.service as string).trim(),
      location: (input.location as string).trim(),
      message: (input.message as string).trim(),
      preferredDate: input.enquiryType === 'booking' ? (input.preferredDate as string) : null,
      preferredTime: input.enquiryType === 'booking' ? (input.preferredTime as string) : null,
      turnstileToken: input.turnstileToken as string,
      company: typeof input.company === 'string' ? input.company : '',
    },
  }
}
