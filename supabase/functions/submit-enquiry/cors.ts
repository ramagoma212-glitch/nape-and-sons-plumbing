// A small, explicit origin allowlist rather than a wildcard. This endpoint
// accepts customer-entered data, so keeping CORS scoped to known origins is
// a cheap extra layer even though Turnstile + server-side validation are the
// real defences (a wildcard here would still be safe against those, but
// there's no reason to widen it when the caller is a single known website).
const ALLOWED_ORIGINS = new Set([
  'https://napeandsonsplumbing.co.za',
  'http://localhost:5173', // vite dev
  'http://localhost:4173', // vite preview
])

export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    Vary: 'Origin',
  }
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}
