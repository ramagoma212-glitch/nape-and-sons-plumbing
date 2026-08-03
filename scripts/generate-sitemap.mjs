// Build-time sitemap generator. Runs automatically after `npm run build`
// (via the "postbuild" script in package.json) and writes dist/sitemap.xml.
//
// Project detail URLs are extracted directly from src/data/projects.js as
// plain text (not imported as a module), so this script never needs to
// resolve the file's Vite-only image imports and has zero network
// dependency — it stays reliable even if Supabase is unreachable at build
// time. src/data/projects.js remains the single source of truth for
// project slugs; nothing here duplicates or hand-maintains that list.
//
// If a project is added or removed only through the admin dashboard (i.e.
// it only exists in Supabase, not in the local fallback data), it won't
// appear here until the fallback data is also updated — acceptable for a
// simple, dependency-free sitemap.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SITE_URL = (process.env.VITE_SITE_URL || 'https://napeandsonsplumbing.co.za').replace(/\/$/, '')

const STATIC_PAGES = [
  { path: '/', priority: '1.0' },
  { path: '/about', priority: '0.8' },
  { path: '/services', priority: '0.9' },
  { path: '/projects', priority: '0.8' },
  { path: '/contact', priority: '0.9' },
  { path: '/plumber-polokwane', priority: '0.9' },
]

const PROJECT_DATA_FILE = fileURLToPath(new URL('../src/data/projects.js', import.meta.url))
const OUTPUT_FILE = fileURLToPath(new URL('../dist/sitemap.xml', import.meta.url))

function getProjectSlugs() {
  const source = readFileSync(PROJECT_DATA_FILE, 'utf-8')
  const matches = [...source.matchAll(/slug:\s*'([^']+)'/g)]
  return matches.map((match) => match[1])
}

function urlEntry(loc, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`
}

function main() {
  const projectSlugs = getProjectSlugs()

  const entries = [
    ...STATIC_PAGES.map((page) => urlEntry(`${SITE_URL}${page.path}`, page.priority)),
    ...projectSlugs.map((slug) => urlEntry(`${SITE_URL}/projects/${slug}`, '0.7')),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`

  if (!existsSync(fileURLToPath(new URL('../dist', import.meta.url)))) {
    console.warn('generate-sitemap: dist/ does not exist yet — skipping (run after `vite build`).')
    return
  }

  writeFileSync(OUTPUT_FILE, xml)
  console.log(
    `generate-sitemap: wrote dist/sitemap.xml with ${entries.length} URLs (${STATIC_PAGES.length} pages + ${projectSlugs.length} projects).`,
  )
}

main()
