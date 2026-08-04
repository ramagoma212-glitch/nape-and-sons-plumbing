import { Helmet } from 'react-helmet-async'
import { business } from '../data/business'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://napeandsonsplumbing.co.za'

// Only known business information is included. Ratings, review counts, opening
// hours, coordinates and price range are intentionally omitted until confirmed.
export default function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    name: business.name,
    // Genuinely used by customers to refer to this business — not invented
    // for SEO purposes. See src/data/business.js.
    alternateName: business.alternateName,
    telephone: business.phoneHref.replace('tel:', ''),
    email: business.email,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.addressParts.streetAddress,
      addressLocality: business.addressParts.addressLocality,
      addressRegion: business.addressParts.addressRegion,
      addressCountry: business.addressParts.addressCountry,
    },
    areaServed: business.areas,
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  )
}
