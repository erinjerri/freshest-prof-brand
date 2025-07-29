// src/app/(frontend)/search/page.tsx
import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { Category, Post } from '@/payload-types' // Correct: Category and Post from auto-generated types
import { CardPostData } from '@/custom-payload-types' // Correct: CardPostData from your custom types file

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
    depth: 1, // With depth: 1, categories should be populated as objects (Category)
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

  // Transform posts.docs to match CardPostData
  const transformedPosts: CardPostData[] = posts.docs.map((doc) => {
    // doc.categories is (number | Category)[] | null from Payload's Post type
    // We ensure it's an array for CardPostData, even if it was null
    const categories = doc.categories || []

    // The mapping logic here depends on what `CardPostData['categories']` expects.
    // If it expects `(number | Category)[]`, then directly assigning `categories` is fine.
    // If it expects `Category[]` (only objects), you might need to filter out numbers or ensure your Payload config
    // always populates full objects. Given your `payload-types.ts`, `(number | Category)[]` is correct.
    const mappedCategories = categories.map((cat) => {
      // If categories are always populated as objects due to depth: 1, this map might be redundant,
      // but it handles cases where they might still be IDs or ensures the exact type for CardPostData.
      if (typeof cat === 'object' && 'id' in cat) {
        return cat // It's already a Category object
      }
      return cat // It's a number (ID)
    })

    return {
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      meta: doc.meta,
      categories: mappedCategories as (number | Category)[], // Explicitly cast to match CardPostData's categories type
      publishedAt: doc.publishedAt,
    } as CardPostData // Explicitly cast the entire object to CardPostData
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
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
