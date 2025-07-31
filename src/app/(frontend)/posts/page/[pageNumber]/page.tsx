import type { Metadata } from 'next/types'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { mapPostToCard } from '@utils/mapPostToCard' // Updated import path
import type { CardPostData } from '@/custom-payload-types'
export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      heroImage: true, // <--- IMPORTANT: Needed for image rendering
      publishedAt: true,
    },
    sort: '-publishedAt',
  })

  // Defensive: fallback sort if not sorted on backend
  const sortedDocs = [...result.docs].sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0
    if (!a.publishedAt) return 1
    if (!b.publishedAt) return -1
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  // 🟢 Map posts to CardPostData!
  const cardPosts: CardPostData[] = sortedDocs.map(mapPostToCard)

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={result.page}
          limit={12}
          totalDocs={result.totalDocs}
        />
      </div>

      {/* Only pass CardPostData[]! */}
      <CollectionArchive posts={cardPosts} />

      <div className="container">
        {result.totalPages > 1 && result.page && (
          <Pagination page={result.page} totalPages={result.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Erin Jerri's Website`,
  }
}
