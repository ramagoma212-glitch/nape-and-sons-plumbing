export const business = {
  name: 'Nape and Sons Plumbing & Projects',
  shortName: 'Nape and Sons',
  // A name genuinely used by customers to refer to this business — not the
  // official brand name, which remains "Nape and Sons Plumbing & Projects".
  alternateName: 'Brain Plumber',
  phoneDisplay: '079 380 2912',
  phoneHref: 'tel:+27793802912',
  whatsappDisplay: '066 204 5866',
  whatsappNumber: '27662045866',
  email: 'napeandsons@gmail.com',
  emailHref: 'mailto:napeandsons@gmail.com',
  address: '14 - 16 148th Street, Honeymoon Residence, Seshego-G, Polokwane, Limpopo',
  // Same address broken into display lines for layouts that present it as
  // a short block (e.g. the Contact page's Location card) rather than one
  // flowing line.
  addressLines: ['14 - 16 148th Street', 'Honeymoon Residence', 'Seshego-G', 'Polokwane, Limpopo'],
  // Structured components for LocalBusinessSchema's PostalAddress. No
  // postal code or coordinates are included since none have been verified.
  addressParts: {
    streetAddress: '14 - 16 148th Street, Honeymoon Residence, Seshego-G',
    addressLocality: 'Polokwane',
    addressRegion: 'Limpopo',
    addressCountry: 'ZA',
  },
  // Service/coverage areas — deliberately separate from the physical
  // address above. Changing the business's street address does not change
  // where it operates.
  areas: ['Polokwane', 'Limpopo', 'Pretoria', 'Johannesburg'],
  social: {
    facebook: 'https://www.facebook.com/share/1UnHhszp16/',
    // Canonical profile URL — the link supplied included TikTok's own
    // share-tracking query params (?_r=1&_t=...), which aren't needed to
    // reach the same profile.
    tiktok: 'https://www.tiktok.com/@nape.and.sons.plu',
  },
  headline: 'Reliable Plumbing Solutions Across Limpopo, Pretoria & Johannesburg',
  supportingCopy:
    'Fast, professional plumbing services for homes and businesses. Available for emergency plumbing, repairs, installations and maintenance.',
}

export function whatsappLink(message) {
  const defaultMessage = `Hi ${business.name}. I found your website and would like to enquire about plumbing services.`
  const text = encodeURIComponent(message || defaultMessage)
  return `https://wa.me/${business.whatsappNumber}?text=${text}`
}
