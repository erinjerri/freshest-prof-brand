import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import { Category, Post } from '@/payload-types'
import { CardPostData } from '@/custom-payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Args = {
  searchParams: Promise<{
    q: string
  }>
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    select: {
      id: true,
      title: true,
      slug: true,
      categories: true,
      meta: true,
      publishedAt: true,
    },
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  const transformedPosts: CardPostData[] = posts.docs.map((doc) => {
    const categories = doc.categories || []

    const mappedCategories = categories.map((cat) => {
      if (typeof cat === 'object' && 'id' in cat) {
        return cat
      }
      return cat
    })

    return {
      id: String(doc.id), // Convert id to string to match CardPostData
      title: doc.title,
      slug: doc.slug, // Keep slug for backend logic but hidden in UI
      meta: doc.meta,
      categories: mappedCategories as (number | Category)[],
      publishedAt: doc.publishedAt,
    } as unknown as CardPostData // Safe cast after id conversion
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>
          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>
      {posts.totalDocs > 0 ? (
        <CollectionArchive posts={transformedPosts} />
      ) : (
        <div className="container">No results found.</div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Search`,
  }
}
