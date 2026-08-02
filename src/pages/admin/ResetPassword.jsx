import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, XCircle } from 'lucide-react'
import Seo from '../../components/Seo'
import { useAuth } from '../../hooks/useAuth'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPassword() {
  const { updatePassword, signOut } = useAuth()
  // 'checking' | 'ready' | 'invalid' | 'success'
  const [status, setStatus] = useState('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('invalid')
      return
    }

    let resolved = false

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        resolved = true
        setStatus('ready')
      }
    })

    // The recovery link may have already been processed (and the session
    // established) before this listener attached, so also check directly.
    supabase.auth.getSession().then(({ data }) => {
      if (resolved) return
      if (data.session) {
        resolved = true
        setStatus('ready')
        return
      }
      // Give the URL-based session detection a brief moment to complete
      // before concluding the link is invalid or expired.
      setTimeout(() => {
        if (!resolved) setStatus('invalid')
      }, 2000)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  function validate() {
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.'
    }
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate()
    setError(validationError)
    if (validationError) return

    setSubmitting(true)
    const { error: updateError } = await updatePassword(password)
    setSubmitting(false)

    if (updateError) {
      setError('Could not update your password. Please request a new reset link and try again.')
      return
    }

    // Clear the temporary recovery session so the dashboard is never
    // exposed automatically — a fresh sign-in is required afterwards.
    await signOut()
    setStatus('success')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5 py-16">
      <Seo
        title="Reset Password"
        description="Reset your admin password for Nape and Sons Plumbing & Projects."
        path="/admin/reset-password"
        noindex
      />

      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card-hover">
        {status === 'checking' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="animate-spin text-navy" size={28} aria-hidden="true" />
            <p className="text-sm text-ink/60">Checking your reset link...</p>
          </div>
        )}

        {status === 'invalid' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <XCircle size={22} aria-hidden="true" />
            </span>
            <h1 className="text-xl font-bold text-navy font-heading">Link Invalid</h1>
            <p className="text-sm text-ink/70">
              This password reset link is invalid or has expired. Please request a new reset link.
            </p>
            <Link to="/admin" className="btn-primary mt-2">
              Request New Reset Link
            </Link>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
              <CheckCircle2 size={22} aria-hidden="true" />
            </span>
            <h1 className="text-xl font-bold text-navy font-heading">Password Updated</h1>
            <p className="text-sm text-ink/70">Your password has been updated successfully.</p>
            <Link to="/admin" className="btn-primary mt-2">
              Return to Admin Login
            </Link>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/5 text-navy">
                <KeyRound size={22} aria-hidden="true" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-navy font-heading">Set a New Password</h1>
              <p className="mt-1 text-sm text-ink/60">Nape and Sons Plumbing &amp; Projects</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-password" className="text-sm font-medium text-navy">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD_LENGTH}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-md border border-navy/15 bg-white px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-navy/50 hover:text-navy"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-ink/50">At least {MIN_PASSWORD_LENGTH} characters.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-password" className="text-sm font-medium text-navy">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
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
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
