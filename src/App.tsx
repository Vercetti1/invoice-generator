import { useEffect, useState } from 'react'
import { InvoiceApp } from './components/InvoiceApp'
import { Landing } from './components/Landing'

/**
 * Hash routing rather than a router dependency: there are two views, and the
 * hash keeps them linkable and refresh-safe on any static host without needing
 * server-side rewrites.
 */
function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return hash
}

export default function App() {
  const route = useHashRoute()
  return route.startsWith('#/app') ? <InvoiceApp /> : <Landing />
}
