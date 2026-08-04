import { Fragment, useEffect, useState } from 'react'
import { Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { adminListEnquiries, adminUpdateEnquiryStatus, adminDeleteEnquiry } from '../../lib/enquiries'

const STATUS_OPTIONS = ['new', 'contacted', 'completed']

const TYPE_LABELS = {
  contact: 'Contact',
  quote: 'Quote',
  booking: 'Booking',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function EnquiriesPanel() {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function loadEnquiries() {
    setLoading(true)
    setError('')
    try {
      const data = await adminListEnquiries()
      setEnquiries(data)
    } catch (loadError) {
      setError(loadError.message || 'Could not load enquiries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEnquiries()
  }, [])

  async function handleStatusChange(enquiry, status) {
    setUpdatingId(enquiry.id)
    try {
      await adminUpdateEnquiryStatus(enquiry.id, status)
      setEnquiries((prev) => prev.map((item) => (item.id === enquiry.id ? { ...item, status } : item)))
    } catch (updateError) {
      setError(updateError.message || 'Could not update this enquiry.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleDelete(enquiry) {
    if (!window.confirm(`Delete this enquiry from ${enquiry.full_name}? This cannot be undone.`)) return
    setDeletingId(enquiry.id)
    try {
      await adminDeleteEnquiry(enquiry.id)
      setEnquiries((prev) => prev.filter((item) => item.id !== enquiry.id))
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete this enquiry.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-navy" size={28} aria-hidden="true" />
      </div>
    )
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {enquiries.length === 0 ? (
        <div className="card p-10 text-center text-ink/60">No enquiries yet.</div>
      ) : (
        <>
        {/* Tablet/desktop: table. Reaching Status/Actions here requires
            scrolling the table sideways (min-w-[720px]) — acceptable at
            tablet+ widths, but not the "drag a giant table" experience we
            want on a phone, which gets its own card layout below. */}
        <div className="hidden overflow-x-auto rounded-xl border border-navy/10 bg-white md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-navy/10 bg-navy/5 text-xs uppercase tracking-wide text-navy/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Preferred</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {enquiries.map((enquiry) => {
                const isExpanded = expandedId === enquiry.id
                return (
                  <Fragment key={enquiry.id}>
                    <tr>
                      <td className="px-4 py-3 font-medium text-navy">{enquiry.full_name}</td>
                      <td className="px-4 py-3 text-ink/70">{TYPE_LABELS[enquiry.enquiry_type] || enquiry.enquiry_type}</td>
                      <td className="px-4 py-3 text-ink/70">{enquiry.service}</td>
                      <td className="px-4 py-3 text-ink/70">
                        <div>{enquiry.phone}</div>
                        {enquiry.email && <div className="text-xs text-ink/50">{enquiry.email}</div>}
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        {enquiry.preferred_date ? (
                          <>
                            {formatDate(enquiry.preferred_date)}
                            {enquiry.preferred_time && <div className="text-xs text-ink/50">{enquiry.preferred_time}</div>}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink/70">{formatDate(enquiry.created_at)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={enquiry.status}
                          disabled={updatingId === enquiry.id}
                          onChange={(event) => handleStatusChange(enquiry, event.target.value)}
                          className="rounded-md border border-navy/15 px-2 py-1 text-xs capitalize focus:outline-none focus:ring-1 focus:ring-gold/50"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : enquiry.id)}
                            className="rounded-md p-2 text-navy/70 hover:bg-navy/5 hover:text-navy"
                            aria-label={isExpanded ? 'Hide details' : 'View details'}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(enquiry)}
                            disabled={deletingId === enquiry.id}
                            className="rounded-md p-2 text-red-500 hover:bg-red-50"
                            aria-label={`Delete enquiry from ${enquiry.full_name}`}
                          >
                            {deletingId === enquiry.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="bg-offwhite/60 px-4 py-4 text-sm text-ink/80">
                          <div className="grid gap-1 sm:grid-cols-2">
                            <p><span className="font-medium text-navy">Location:</span> {enquiry.location}</p>
                            <p><span className="font-medium text-navy">Full name:</span> {enquiry.full_name}</p>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap">
                            <span className="font-medium text-navy">Message:</span> {enquiry.message}
                          </p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Phone: stacked cards. Status is a full-width select (the main
            thing an owner needs to change day-to-day), with expand/delete
            as small icon buttons that stay visible without any sideways
            scrolling. */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {enquiries.map((enquiry) => {
            const isExpanded = expandedId === enquiry.id
            return (
              <div key={enquiry.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-navy">{enquiry.full_name}</p>
                    <p className="mt-0.5 text-xs uppercase tracking-wide text-gold-dark">
                      {TYPE_LABELS[enquiry.enquiry_type] || enquiry.enquiry_type}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : enquiry.id)}
                      className="rounded-md p-2 text-navy/70 hover:bg-navy/5 hover:text-navy"
                      aria-label={isExpanded ? 'Hide details' : 'View details'}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(enquiry)}
                      disabled={deletingId === enquiry.id}
                      className="rounded-md p-2 text-red-500 hover:bg-red-50"
                      aria-label={`Delete enquiry from ${enquiry.full_name}`}
                    >
                      {deletingId === enquiry.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm text-ink/70">
                  <p className="truncate">{enquiry.service}</p>
                  <p className="truncate">
                    {enquiry.phone}
                    {enquiry.email && <span className="text-ink/50"> · {enquiry.email}</span>}
                  </p>
                  <p className="text-xs text-ink/50">
                    Received {formatDate(enquiry.created_at)}
                    {enquiry.preferred_date && (
                      <>
                        {' '}
                        · Preferred {formatDate(enquiry.preferred_date)}
                        {enquiry.preferred_time && ` (${enquiry.preferred_time})`}
                      </>
                    )}
                  </p>
                </div>

                {isExpanded && (
                  <div className="mt-3 rounded-md bg-offwhite/60 p-3 text-sm text-ink/80">
                    <p>
                      <span className="font-medium text-navy">Location:</span> {enquiry.location}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap">
                      <span className="font-medium text-navy">Message:</span> {enquiry.message}
                    </p>
                  </div>
                )}

                <label className="mt-3 flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-navy/60">Status</span>
                  <select
                    value={enquiry.status}
                    disabled={updatingId === enquiry.id}
                    onChange={(event) => handleStatusChange(enquiry, event.target.value)}
                    className="w-full rounded-md border border-navy/15 px-3 py-2 text-sm capitalize focus:outline-none focus:ring-1 focus:ring-gold/50"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )
          })}
        </div>
        </>
      )}
    </div>
  )
}
