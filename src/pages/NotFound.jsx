import { Link } from 'react-router-dom'
import { Wrench, ArrowLeft } from 'lucide-react'
import Seo from '../components/Seo'

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page Not Found"
        description="The page you are looking for could not be found."
        path="/404"
      />
      <section className="flex min-h-[80vh] items-center bg-offwhite">
        <div className="container-page flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy/5 text-navy">
            <Wrench size={30} aria-hidden="true" />
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
            404 Error
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-navy">Page Not Found</h1>
          <p className="mt-4 max-w-md text-ink/70">
            The page you are looking for may have been moved or no longer exists.
          </p>
          <Link to="/" className="btn-primary mt-8">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Home
          </Link>
          <p className="mt-6 text-sm text-ink/60">
            Or visit{' '}
            <Link to="/services" className="font-medium text-gold-dark underline">
              Services
            </Link>
            ,{' '}
            <Link to="/projects" className="font-medium text-gold-dark underline">
              Projects
            </Link>
            , or{' '}
            <Link to="/contact" className="font-medium text-gold-dark underline">
              Contact
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
