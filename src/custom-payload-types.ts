// src/custom-payload-types.ts
import type { Post, Media, Category } from '@/payload-types'

// For rendering archive cards in the UI
export type CardPostData = {
  id: string // Always a string, handled by mapPostToCard
  title: string // Always provided with fallback
  slug: string // Always required for URLs
  meta: {
    title: string // Always provided with fallback
    description: string // Always provided with fallback
    image: (Media & { url: string; alt: string }) | null // Match mapPostToCard output
  }
  categories: (number | Category)[] | null // CAN be null, matches mapPostToCard output
  publishedAt: string // Always provided with fallback
}
