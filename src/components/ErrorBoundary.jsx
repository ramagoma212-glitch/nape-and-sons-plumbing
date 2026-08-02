import { Component } from 'react'
import { Wrench } from 'lucide-react'

/**
 * Top-level safety net for unexpected rendering errors. Catches errors
 * anywhere in the tree below it (public pages and admin pages alike, since
 * this is mounted once at the root) and shows a clean, on-brand message
 * instead of a blank screen or a raw stack trace. The real error is only
 * ever logged to the developer console — never rendered to the visitor.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled application error:', error, info)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-5 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy/5 text-navy">
          <Wrench size={30} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-navy font-heading">Something Went Wrong</h1>
        <p className="mt-4 max-w-md text-ink/70">
          Please refresh the page or contact Nape and Sons Plumbing &amp; Projects for assistance.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {/* Plain anchors/full reloads on purpose, not client-side router
              navigation — the app tree is in an unknown broken state, so a
              hard reload is the most reliable way to recover it. */}
          <button type="button" onClick={() => window.location.reload()} className="btn-primary">
            Refresh Page
          </button>
          <a href="/" className="btn-secondary">
            Go Home
          </a>
        </div>
      </div>
    )
  }
}
