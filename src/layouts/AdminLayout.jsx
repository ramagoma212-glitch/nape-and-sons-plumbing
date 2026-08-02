import { Link, Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function AdminLayout() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-offwhite">
      <header className="border-b border-navy/10 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin/dashboard" className="font-heading font-bold text-navy">
            Nape and Sons <span className="text-gold-dark">Admin</span>
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 text-sm font-medium text-navy/70 hover:text-navy"
          >
            <LogOut size={16} aria-hidden="true" />
            Log out
          </button>
        </div>
      </header>
      <main className="container-page py-10">
        <Outlet />
      </main>
    </div>
  )
}
