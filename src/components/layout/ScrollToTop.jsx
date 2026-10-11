import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Automatically resets window scroll to top on route transition
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
