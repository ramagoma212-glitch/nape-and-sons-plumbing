import { Helmet } from 'react-helmet-async'
import defaultOgImage from '../assets/projects/modern-shower-installation.jpeg'

// Production canonical domain (root, no www — www redirects to this at the
// hosting/DNS level). VITE_SITE_URL overrides this per environment; the
// fallback below is the real production domain, not a placeholder.
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://napeandsonsplumbing.co.za'
const SITE_NAME = 'Nape and Sons Plumbing & Projects'
const DEFAULT_IMAGE = `${SITE_URL}${defaultOgImage}`

export default function Seo({ title, description, path = '/', image = DEFAULT_IMAGE, noindex = false }) {
  const url = `${SITE_URL}${path}`
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

  // Every tag is a flat, individually-conditional direct child of <Helmet> —
  // no wrapping fragment. react-helmet-async 2.x silently drops tags nested
  // inside a fragment child instead of rendering them, so grouping the OG/
  // Twitter block in a <>...</> (as an earlier version of this file did)
  // resulted in every one of those tags being missing from the real page.
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {!noindex && <link rel="canonical" href={url} />}
      {!noindex && <meta property="og:type" content="website" />}
      {!noindex && <meta property="og:site_name" content={SITE_NAME} />}
      {!noindex && <meta property="og:title" content={fullTitle} />}
      {!noindex && <meta property="og:description" content={description} />}
      {!noindex && <meta property="og:url" content={url} />}
      {!noindex && <meta property="og:image" content={image} />}
      {!noindex && <meta property="og:locale" content="en_ZA" />}

      {!noindex && <meta name="twitter:card" content="summary_large_image" />}
      {!noindex && <meta name="twitter:title" content={fullTitle} />}
      {!noindex && <meta name="twitter:description" content={description} />}
      {!noindex && <meta name="twitter:image" content={image} />}
    </Helmet>
  )
}
