import type { Post, Category, Media } from '@/payload-types'
import type { CardPostData } from '@/custom-payload-types'

export function mapPostToCard(post: Post): CardPostData {
  const validCategories = Array.isArray(post.categories)
    ? post.categories.filter(
        (cat): cat is number | Category =>
          typeof cat === 'number' || (typeof cat === 'object' && cat !== null && 'id' in cat),
      )
    : null
  const image =
    post.heroImage && typeof post.heroImage === 'object' && post.heroImage !== null
      ? {
          ...post.heroImage,
          url: post.heroImage.url ?? '',
          alt: post.heroImage.alt ?? post.title ?? '',
        }
      : null
  return {
    id: typeof post.id === 'string' ? post.id : String(post.id ?? ''),
    title: post.title ?? '',
    slug: post.slug ?? '',
    publishedAt: post.publishedAt ?? '',
    categories: validCategories,
    meta: {
      title: post.meta?.title ?? '',
      description: post.meta?.description ?? '',
      image: image as (Media & { url: string; alt: string }) | null,
    },
  }
}
