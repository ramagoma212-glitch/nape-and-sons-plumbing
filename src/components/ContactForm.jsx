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

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  email: '',
  service: '',
  location: '',
  message: '',
}

function validate(form) {
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
  return errors
}

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (status === 'submitting') return

    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setStatus('submitting')
    try {
      await submitEnquiry(form)
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
        <h3 className="text-xl font-semibold text-navy font-heading">Thank you</h3>
        <p className="text-ink/70">
          Your request has been received. Nape and Sons Plumbing & Projects will contact you
          regarding your enquiry.
        </p>
        <button type="button" className="btn-secondary mt-2" onClick={() => setStatus('idle')}>
          Send another enquiry
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-5 p-6 sm:p-8">
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

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          Something went wrong sending your enquiry. Please call or WhatsApp us directly.
        </p>
      )}

      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full sm:w-auto">
        {status === 'submitting' && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
        {status === 'submitting' ? 'Sending...' : 'Request a Quote'}
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
