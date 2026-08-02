import { Helmet } from 'react-helmet-async'
import { business } from '../data/business'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.napeandsons.co.za'

// Only known business information is included. Ratings, review counts, opening
// hours, coordinates and price range are intentionally omitted until confirmed.
export default function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    name: business.name,
    telephone: business.phoneHref.replace('tel:', ''),
    email: business.email,
    url: SITE_URL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressRegion: 'Limpopo',
      addressCountry: 'ZA',
    },
    areaServed: business.areas,
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  )
}
