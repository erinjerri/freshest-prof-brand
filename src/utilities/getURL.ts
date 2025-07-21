// getURL.ts
import canUseDOM from './canUseDOM'

const FALLBACK_LOCAL = 'http://localhost:3000'

export const getServerSideURL = (): string => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL || FALLBACK_LOCAL
  if (!url) throw new Error('Missing NEXT_PUBLIC_SERVER_URL and no fallback defined.')
  return url
}

export const getClientSideURL = (): string => {
  if (canUseDOM) {
    const { protocol, hostname, port } = window.location
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`
  }

  return process.env.NEXT_PUBLIC_SERVER_URL || FALLBACK_LOCAL
}
