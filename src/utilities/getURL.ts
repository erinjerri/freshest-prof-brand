// utilities/getURL.ts

export const getServerSideURL = (): string => {
  // In production, use NEXT_PUBLIC_SERVER_URL
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL
  }

  // In development, default to localhost
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  }

  // Fallback for Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Last resort fallback
  return 'http://localhost:3000'
}

// Alternative client-side URL getter
export const getClientSideURL = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return getServerSideURL()
}
