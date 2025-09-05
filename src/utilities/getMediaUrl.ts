// src/utilities/getMediaUrl.ts
import { getClientSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting.
 * It handles full URLs (http/https) directly and prepends the client-side base URL if necessary.
 * @param url The original URL from the resource (can be relative path or full URL).
 * @param cacheTag Optional cache tag to append to the URL.
 * @returns Properly formatted URL with cache tag if provided.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  // If the URL already has http:// or https:// protocol, use it directly,
  // but rewrite Supabase-hosted Payload proxy paths to the current origin.
  // Some media docs may contain e.g. https://<project>.supabase.co/api/media/file/filename
  // which must be served by our own app at /api/media/file/*, not Supabase.
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url)
      const isSupabase = /\.supabase\.co$/i.test(parsed.hostname)
      const isPayloadProxy = parsed.pathname.startsWith('/api/media/file/')
      if (isSupabase && isPayloadProxy) {
        const base = getClientSideURL()
        const rewritten = `${base}${parsed.pathname}`
        return cacheTag ? `${rewritten}?${cacheTag}` : rewritten
      }
    } catch {
      // fall through to return original URL
    }
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  // If it's a relative URL (e.g., '/filename.webp' or '/api/media/file/filename.webp' if not a full URL)
  // Prepend the client-side base URL. This typically applies if you are using Payload's local file storage,
  // or if the URL from Payload is just a path that needs the server URL.
  const baseUrl = getClientSideURL()
  return cacheTag ? `${baseUrl}${url}?${cacheTag}` : `${baseUrl}${url}`
}
