import { Helmet } from 'react-helmet-async'
import defaultOgImage from '../assets/projects/modern-shower-installation.jpeg'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.napeandsons.co.za'
const SITE_NAME = 'Nape and Sons Plumbing & Projects'
const DEFAULT_IMAGE = `${SITE_URL}${defaultOgImage}`

export default function Seo({ title, description, path = '/', image = DEFAULT_IMAGE }) {
  const url = `${SITE_URL}${path}`
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_ZA" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
