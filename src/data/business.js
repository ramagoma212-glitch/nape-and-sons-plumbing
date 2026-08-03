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
  address: 'Stand 400 Moletjie Ceres',
  areas: ['Polokwane', 'Limpopo', 'Pretoria', 'Johannesburg'],
  headline: 'Reliable Plumbing Solutions Across Limpopo, Pretoria & Johannesburg',
  supportingCopy:
    'Fast, professional plumbing services for homes and businesses. Available for emergency plumbing, repairs, installations and maintenance.',
}

export function whatsappLink(message) {
  const defaultMessage = `Hi ${business.name}. I found your website and would like to enquire about plumbing services.`
  const text = encodeURIComponent(message || defaultMessage)
  return `https://wa.me/${business.whatsappNumber}?text=${text}`
}
