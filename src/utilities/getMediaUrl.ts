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
  // but rewrite Supabase-hosted Payload proxy paths to a stable relative path.
  // This avoids SSR/CSR host mismatches during hydration.
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url)
      const isSupabase = /\.supabase\.co$/i.test(parsed.hostname)
      const isPayloadProxy = parsed.pathname.startsWith('/api/media/file/')
      if (isSupabase && isPayloadProxy) {
        const pathOnly = parsed.pathname
        return cacheTag ? `${pathOnly}?${cacheTag}` : pathOnly
      }
    } catch {
      // fall through to return original URL
    }
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  // If it's a relative URL, return the path unchanged for stability
  // so that SSR and CSR produce identical markup.
  return cacheTag ? `${url}?${cacheTag}` : url
}
