import type { Post, Category, Media } from '@/payload-types'
import type { CardPostData } from '@/custom-payload-types'

export function mapPostToCard(post: Post): CardPostData {
  const validCategories = Array.isArray(post.categories)
    ? post.categories.filter(
        (cat): cat is number | Category =>
          typeof cat === 'number' || (typeof cat === 'object' && cat !== null && 'id' in cat),
      )
    : null

  // Prefer meta.image; fall back to heroImage
  const metaImage =
    post.meta && typeof post.meta.image === 'object' && post.meta.image !== null
      ? (post.meta.image as Media)
      : null
  const heroImage =
    post.heroImage && typeof post.heroImage === 'object' && post.heroImage !== null
      ? (post.heroImage as Media)
      : null

  const chosen: Media | null = metaImage ?? heroImage

  const image = chosen
    ? {
        ...chosen,
        url: chosen.url ?? (chosen.filename ? `/api/media/file/${chosen.filename}` : ''),
        alt: chosen.alt ?? post.title ?? '',
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
