import { useEffect, useState } from 'react'

export function useRoute() {
  const [h, setH] = useState(location.hash.slice(1) || '/')
  useEffect(() => {
    const f = () => setH(location.hash.slice(1) || '/')
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return h
}

export const go = (p: string) => {
  location.hash = p
}

export function useLoading(key: any, ms = 600) {
  const [l, setL] = useState(true)
  useEffect(() => {
    setL(true)
    const t = setTimeout(() => setL(false), ms)
    return () => clearTimeout(t)
  }, [key])
  return l
}
