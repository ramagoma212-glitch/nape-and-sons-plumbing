import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

// Known-good production origin, used only as a fallback when the browser's
// own origin can't be trusted (see safeOrigin() below) — never as the
// primary source, so localhost/Netlify preview testing is unaffected.
const PRODUCTION_ORIGIN = 'https://napeandsonsplumbing.co.za'

// window.location.origin is normally reliable, but it can literally be the
// string "null" in a handful of real-world browsing contexts (a sandboxed
// iframe without allow-same-origin, some in-app/webview browsers used by
// email or social apps, file:// access). A password-reset redirectTo built
// from that would send Supabase a link to "null/admin/reset-password" —
// exactly the "null" / unreachable-link symptom reported from a real
// production test. Guard against it here so the link sent to the owner's
// inbox is always a real, reachable URL.
function safeOrigin() {
  const origin = window.location.origin
  if (!origin || origin === 'null' || origin === 'undefined') {
    return PRODUCTION_ORIGIN
  }
  return origin
}

const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => ({ error: 'Supabase is not configured.' }),
  signOut: async () => {},
  requestPasswordReset: async () => ({ error: 'Supabase is not configured.' }),
  updatePassword: async () => ({ error: 'Supabase is not configured.' }),
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Add your environment variables first.' }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
  }

  // Deliberately does not reveal whether the email address has an account —
  // Supabase's own resetPasswordForEmail already avoids that, and we mirror
  // the same neutral outcome for any error here rather than surfacing it.
  async function requestPasswordReset(email) {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Add your environment variables first.' }
    }
    const redirectTo = `${safeOrigin()}/admin/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    return { error: error?.message ?? null }
  }

  async function updatePassword(newPassword) {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Add your environment variables first.' }
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error?.message ?? null }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut, requestPasswordReset, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
