import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scrolls to the element matching the URL hash, offsetting for the fixed header. */
export function useScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '')
    const element = document.getElementById(id)
    if (!element) return

    const timeout = setTimeout(() => {
      const top = element.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top, behavior: 'smooth' })
    }, 80)

    return () => clearTimeout(timeout)
  }, [location])
}
