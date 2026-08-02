import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

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
    const redirectTo = `${window.location.origin}/admin/reset-password`
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
