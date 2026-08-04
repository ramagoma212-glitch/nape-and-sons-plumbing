// Pure email template builders — no network calls, no provider-specific
// code. Kept separate from email-provider.ts so the transactional email
// provider can be swapped later without touching any wording/design here.
//
// Shared between submit-enquiry (sends the notification synchronously,
// right after the database insert that creates it) and send-enquiry-email
// (kept working as a standalone function for manually retrying a specific
// enquiry whose notification_sent_at is still null — see its own file for
// why it still exists).

export interface EnquiryRecord {
  id: string
  enquiry_type: 'contact' | 'quote' | 'booking' | string
  full_name: string
  phone: string
  email: string | null
  service: string
  location: string
  message: string
  preferred_date?: string | null
  preferred_time?: string | null
}

export interface OutgoingEmail {
  to: string
  from: string
  replyTo?: string
  subject: string
  html: string
  text: string
}

const BUSINESS_EMAIL = 'napeandsons@gmail.com'
// Only usable once napeandsonsplumbing.co.za is verified with the email
// provider — see README.md "Email Notification System" for the activation
// steps. Not used anywhere until then.
const FROM_ADDRESS = 'Nape and Sons Plumbing & Projects <website@napeandsonsplumbing.co.za>'
const SITE_NAME = 'Nape and Sons Plumbing & Projects'
const PHONE_DISPLAY = '079 380 2912'
const WHATSAPP_DISPLAY = '066 204 5866'

const TYPE_LABELS: Record<string, string> = {
  contact: 'Contact Enquiry',
  quote: 'Quote Request',
  booking: 'Booking Request',
}

const BUSINESS_SUBJECTS: Record<string, string> = {
  contact: 'New Contact Enquiry | Nape and Sons Plumbing',
  quote: 'New Quote Request | Nape and Sons Plumbing',
  booking: 'New Booking Request | Nape and Sons Plumbing',
}

const CUSTOMER_SUBJECTS: Record<string, string> = {
  contact: `We received your message | ${SITE_NAME}`,
  quote: `We received your quote request | ${SITE_NAME}`,
  booking: `We received your booking request | ${SITE_NAME}`,
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Table-based layout on purpose — modern CSS (flexbox/grid) is not reliably
// supported across email clients (Outlook in particular). Kept deliberately
// simple: no external images, no web fonts, no complex nesting.
function emailShell(bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#F7F8F8;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F8F8;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background-color:#0B1F33;padding:20px 28px;">
                <span style="color:#ffffff;font-size:16px;font-weight:bold;">${SITE_NAME}</span>
                <div style="color:#D5A84B;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-top:2px;">Plumbing &amp; Projects</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:#17212B;font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background-color:#F7F8F8;color:#6b7280;font-size:12px;">
                ${SITE_NAME} &middot; ${PHONE_DISPLAY} &middot; ${BUSINESS_EMAIL}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function fieldRow(label: string, value?: string | null): string {
  if (!value) return ''
  return `<tr>
    <td style="padding:4px 8px 4px 0;color:#6b7280;width:130px;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
    <td style="padding:4px 0;color:#17212B;">${escapeHtml(String(value))}</td>
  </tr>`
}

/** Business notification email — sent to napeandsons@gmail.com for every
 *  new enquiry. Reply-To is set to the customer's own email (when supplied)
 *  so the owner can hit "reply" and message the customer directly. */
export function buildBusinessEmail(enquiry: EnquiryRecord): OutgoingEmail {
  const typeLabel = TYPE_LABELS[enquiry.enquiry_type] || 'Enquiry'
  const subject = BUSINESS_SUBJECTS[enquiry.enquiry_type] || `New Enquiry | ${SITE_NAME}`
  const isBooking = enquiry.enquiry_type === 'booking'

  const rows = [
    fieldRow('Enquiry Type', typeLabel),
    fieldRow('Customer Name', enquiry.full_name),
    fieldRow('Phone', enquiry.phone),
    fieldRow('Email', enquiry.email),
    fieldRow('Service', enquiry.service),
    fieldRow('Location', enquiry.location),
    isBooking ? fieldRow('Preferred Date', enquiry.preferred_date) : '',
    isBooking ? fieldRow('Preferred Time', enquiry.preferred_time) : '',
  ]
    .filter(Boolean)
    .join('')

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;font-weight:bold;color:#0B1F33;">New ${escapeHtml(typeLabel)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${rows}
    </table>
    <p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #eee;color:#17212B;">
      <strong>Message:</strong><br />${escapeHtml(enquiry.message || '').replace(/\n/g, '<br />')}
    </p>
  `

  const textLines = [
    `New ${typeLabel}`,
    `Customer Name: ${enquiry.full_name}`,
    `Phone: ${enquiry.phone}`,
    enquiry.email ? `Email: ${enquiry.email}` : '',
    `Service: ${enquiry.service}`,
    `Location: ${enquiry.location}`,
    isBooking && enquiry.preferred_date ? `Preferred Date: ${enquiry.preferred_date}` : '',
    isBooking && enquiry.preferred_time ? `Preferred Time: ${enquiry.preferred_time}` : '',
    '',
    'Message:',
    enquiry.message || '',
  ].filter((line) => line !== '')

  return {
    to: BUSINESS_EMAIL,
    from: FROM_ADDRESS,
    replyTo: enquiry.email || undefined,
    subject,
    html: emailShell(bodyHtml),
    text: textLines.join('\n'),
  }
}

/** Customer confirmation email — only built when the customer supplied an
 *  email address. Never confirms a booking date/time or a quoted price;
 *  wording is deliberately non-committal per business requirements. */
export function buildCustomerEmail(enquiry: EnquiryRecord): OutgoingEmail | null {
  if (!enquiry.email) return null

  const firstName = (enquiry.full_name || '').trim().split(/\s+/)[0] || 'there'
  const subject = CUSTOMER_SUBJECTS[enquiry.enquiry_type] || `We received your request | ${SITE_NAME}`

  let intro: string
  let note: string

  if (enquiry.enquiry_type === 'quote') {
    intro = `Thank you for requesting a quote from ${SITE_NAME}.`
    note =
      'We have received your request. No price or quotation has been automatically approved — our team will review the details and contact you directly.'
  } else if (enquiry.enquiry_type === 'booking') {
    intro = `Thank you for your booking request with ${SITE_NAME}.`
    note =
      'Your requested date and time are not yet confirmed. Our team will contact you to confirm availability and the booking details.'
  } else {
    intro = `Thank you for contacting ${SITE_NAME}.`
    note = 'We have received your enquiry and will contact you regarding the details provided.'
  }

  const bodyHtml = `
    <p style="margin:0 0 16px;">Hello ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 12px;">${escapeHtml(intro)}</p>
    <p style="margin:0 0 16px;">${escapeHtml(note)}</p>
    <p style="margin:0 0 16px;">If your matter is urgent, you can call us on <strong>${PHONE_DISPLAY}</strong> or WhatsApp us on <strong>${WHATSAPP_DISPLAY}</strong>.</p>
    <p style="margin:20px 0 0;">Kind regards,<br />${SITE_NAME}</p>
  `

  const text = [
    `Hello ${firstName},`,
    '',
    intro,
    '',
    note,
    '',
    `If your matter is urgent, you can call us on ${PHONE_DISPLAY} or WhatsApp us on ${WHATSAPP_DISPLAY}.`,
    '',
    'Kind regards,',
    SITE_NAME,
  ].join('\n')

  return {
    to: enquiry.email,
    from: FROM_ADDRESS,
    replyTo: BUSINESS_EMAIL,
    subject,
    html: emailShell(bodyHtml),
    text,
  }
}
