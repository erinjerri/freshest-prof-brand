// src/custom-payload-types.ts
// Import the auto-generated types from Payload
import type { Post, Media, Category } from '@/payload-types'

// Define CardPostData as a subset of Post
export type CardPostData = {
  id: Post['id']
  title: Post['title']
  slug: Post['slug']
  // --- CHANGE THIS LINE ---
  meta?: {
    // The object can be undefined or null
    title?: string | null
    description?: string | null
    image?: string | Media | null
  } | null // <--- ADDED '| null' here for the 'meta' object itself
  // --- END CHANGE ---
  categories?: (number | Category)[] | null
  publishedAt?: Post['publishedAt']
}
