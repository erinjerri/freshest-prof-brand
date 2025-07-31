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

  // If the URL already has http:// or https:// protocol, use it directly.
  // This covers both direct S3 URLs (if stored that way) AND Payload's local proxy URLs (e.g., http://localhost:3000/api/media/file/...)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  // If it's a relative URL (e.g., '/filename.webp' or '/api/media/file/filename.webp' if not a full URL)
  // Prepend the client-side base URL. This typically applies if you are using Payload's local file storage,
  // or if the URL from Payload is just a path that needs the server URL.
  const baseUrl = getClientSideURL()
  return cacheTag ? `${baseUrl}${url}?${cacheTag}` : `${baseUrl}${url}`
}
