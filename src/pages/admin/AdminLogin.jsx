import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2, Lock } from 'lucide-react'
import Seo from '../../components/Seo'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export default function AdminLogin() {
  const { user, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy">
        <Loader2 className="animate-spin text-white" size={32} aria-hidden="true" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/admin/dashboard" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)
    if (signInError) setError(signInError)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5 py-16">
      <Seo title="Admin Login" description="Admin login for Nape and Sons Plumbing & Projects." path="/admin" />

      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card-hover">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/5 text-navy">
            <Lock size={22} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-navy font-heading">Admin Login</h1>
          <p className="mt-1 text-sm text-ink/60">Nape and Sons Plumbing &amp; Projects</p>
        </div>

        {!isSupabaseConfigured && (
          <p className="mt-6 rounded-md bg-gold/10 p-3 text-xs text-navy">
            Supabase is not configured yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> to your environment variables to enable admin login.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-navy">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-navy/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-navy">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-navy/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
