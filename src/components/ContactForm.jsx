import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { submitEnquiry } from '../lib/enquiries'

const SERVICE_OPTIONS = [
  'Blocked Drain',
  'Leak Detection',
  'Geyser',
  'Pipe Repair',
  'Bathroom Plumbing',
  'Kitchen Plumbing',
  'Water Tank / Backup System',
  'Emergency Plumbing',
  'Other',
]

const TIME_OPTIONS = ['Morning', 'Afternoon', 'Any Time']

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  email: '',
  service: '',
  location: '',
  message: '',
  preferredDate: '',
  preferredTime: '',
  company: '', // honeypot — real visitors never see or fill this
}

const COPY = {
  contact: {
    submitLabel: 'Send Message',
    successTitle: 'Thank you',
    successMessage:
      'Your message has been received. Nape and Sons Plumbing & Projects will contact you regarding your enquiry.',
  },
  quote: {
    submitLabel: 'Request a Quote',
    successTitle: 'Thank you',
    successMessage:
      'Your request has been received. Nape and Sons Plumbing & Projects will contact you regarding your enquiry.',
  },
  booking: {
    submitLabel: 'Request a Booking',
    successTitle: 'Thank you',
    successMessage:
      'Your booking request has been received. Nape and Sons Plumbing & Projects will contact you to confirm the date and details.',
  },
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function validate(form, enquiryType) {
  const errors = {}
  if (!form.fullName.trim()) errors.fullName = 'Please enter your full name.'
  if (!form.phone.trim()) errors.phone = 'Please enter a phone number.'
  else if (!/^[\d+()\s-]{7,}$/.test(form.phone.trim())) errors.phone = 'Please enter a valid phone number.'
  if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }
  if (!form.service) errors.service = 'Please select the service you need.'
  if (!form.location.trim()) errors.location = 'Please let us know your location.'
  if (!form.message.trim()) errors.message = 'Please add a short message describing the issue.'

  if (enquiryType === 'booking') {
    if (!form.preferredDate) {
      errors.preferredDate = 'Please choose a preferred date.'
    } else if (form.preferredDate < todayIso()) {
      errors.preferredDate = 'Please choose a date that is not in the past.'
    }
    if (!form.preferredTime) errors.preferredTime = 'Please choose a preferred time.'
  }

  return errors
}

export default function ContactForm({ enquiryType = 'quote' }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const copy = COPY[enquiryType] || COPY.quote

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (status === 'submitting') return

    // Honeypot: real visitors never see or fill this field. If it has a
    // value, silently treat the submission as successful without ever
    // touching the database, so automated bots get no signal that anything
    // was rejected.
    if (form.company.trim()) {
      setStatus('success')
      setForm(EMPTY_FORM)
      return
    }

    const validationErrors = validate(form, enquiryType)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setStatus('submitting')
    try {
      await submitEnquiry({ ...form, enquiryType })
      setStatus('success')
      setForm(EMPTY_FORM)
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="card flex flex-col items-center gap-4 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
          <CheckCircle2 size={30} aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-navy font-heading">{copy.successTitle}</h3>
        <p className="text-ink/70">{copy.successMessage}</p>
        <button type="button" className="btn-secondary mt-2" onClick={() => setStatus('idle')}>
          Send another enquiry
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-5 p-6 sm:p-8">
      {/* Honeypot field: hidden from sighted users and unreachable by tab,
          but visible to naive bots that auto-fill every input. */}
      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={handleChange}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" name="fullName" error={errors.fullName}>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={handleChange}
            className={inputClass(errors.fullName)}
          />
        </Field>

        <Field label="Phone Number" name="phone" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            className={inputClass(errors.phone)}
          />
        </Field>

        <Field label="Email" name="email" error={errors.email} optional>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass(errors.email)}
          />
        </Field>

        <Field label="Location" name="location" error={errors.location}>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="e.g. Polokwane, Pretoria East..."
            value={form.location}
            onChange={handleChange}
            className={inputClass(errors.location)}
          />
        </Field>
      </div>

      <Field label="Service Required" name="service" error={errors.service}>
        <select
          id="service"
          name="service"
          value={form.service}
          onChange={handleChange}
          className={inputClass(errors.service)}
        >
          <option value="" disabled>
            Select a service
          </option>
          {SERVICE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      {enquiryType === 'booking' && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Preferred Date" name="preferredDate" error={errors.preferredDate}>
            <input
              id="preferredDate"
              name="preferredDate"
              type="date"
              min={todayIso()}
              value={form.preferredDate}
              onChange={handleChange}
              className={inputClass(errors.preferredDate)}
            />
          </Field>

          <Field label="Preferred Time" name="preferredTime" error={errors.preferredTime}>
            <select
              id="preferredTime"
              name="preferredTime"
              value={form.preferredTime}
              onChange={handleChange}
              className={inputClass(errors.preferredTime)}
            >
              <option value="" disabled>
                Select a time
              </option>
              {TIME_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      <Field label="Message" name="message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          className={inputClass(errors.message)}
        />
      </Field>

      {enquiryType === 'booking' && (
        <p className="text-xs text-ink/50">
          This is a request only. We will contact you to confirm the date and time.
        </p>
      )}

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          Something went wrong sending your enquiry. Please call or WhatsApp us directly.
        </p>
      )}

      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full sm:w-auto">
        {status === 'submitting' && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
        {status === 'submitting' ? 'Sending...' : copy.submitLabel}
      </button>
    </form>
  )
}

function Field({ label, name, error, optional, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-navy">
        {label} {optional && <span className="text-ink/40 font-normal">(optional)</span>}
      </label>
      {children}
      {error && (
        <span role="alert" className="text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </div>
  )
}

function inputClass(error) {
  return `w-full rounded-md border bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-gold/50 ${
    error ? 'border-red-400' : 'border-navy/15'
  }`
}
