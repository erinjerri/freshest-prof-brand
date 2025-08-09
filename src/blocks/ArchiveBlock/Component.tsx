'use client'

import type { ArchiveBlock as ArchiveBlockProps, Post, Category } from '@/payload-types'
import React, { useEffect, useMemo, useState } from 'react'
import RichText from '@/components/RichText'
import { CollectionArchive } from '@/components/CollectionArchive'
import { mapPostToCard } from '@utils/mapPostToCard'

export const ArchiveBlock: React.FC<ArchiveBlockProps & { id?: string }> = (props) => {
  const { id, introContent, selectedDocs = [], populateBy, relationTo, categories, limit } = props

  const [mappedPosts, setMappedPosts] = useState<ReturnType<typeof mapPostToCard>[]>([])

  const selectedCategoryIds = useMemo(() => {
    if (!categories || categories.length === 0) return null
    return categories
      .map((cat) =>
        typeof cat === 'object' && cat ? cat.id : typeof cat === 'number' ? cat : null,
      )
      .filter((v): v is number => v !== null)
  }, [categories])

  useEffect(() => {
    // If populated by explicit selection, map those docs
    if (populateBy === 'selection' && Array.isArray(selectedDocs) && selectedDocs.length > 0) {
      const posts = selectedDocs
        .map((doc) => (typeof doc.value === 'object' ? (doc.value as Post) : null))
        .filter((doc): doc is Post => doc !== null)

      setMappedPosts(posts.map(mapPostToCard))
      return
    }

    // Otherwise, fetch from the collection (default: posts)
    if (populateBy === 'collection' && relationTo === 'posts') {
      const controller = new AbortController()
      const fetchPosts = async () => {
        try {
          // Build query with server-side filtering when categories are selected
          const params = new URLSearchParams()
          params.set('sort', '-publishedAt')
          params.set('depth', '1')

          if (selectedCategoryIds && selectedCategoryIds.length > 0) {
            // Ask backend to return all matching docs to avoid client-side page truncation
            params.set('pagination', 'false')
            for (const categoryId of selectedCategoryIds) {
              params.append('where[categories][in]', String(categoryId))
            }
          } else {
            const pageSize = typeof limit === 'number' && limit > 0 ? Math.max(limit, 12) : 12
            params.set('limit', String(pageSize))
          }

          const res = await fetch(`/api/posts?${params.toString()}`, {
            signal: controller.signal,
          })
          if (!res.ok) return
          const data = await res.json()
          const docs: Post[] = Array.isArray(data?.docs) ? data.docs : []

          let filtered = docs
          if (selectedCategoryIds && selectedCategoryIds.length > 0) {
            // Defensive: keep client-side filter in case of any API quirks
            filtered = docs.filter((post) => {
              if (!post.categories || post.categories.length === 0) return false
              return post.categories.some((cat) => {
                const catId =
                  typeof cat === 'object' && cat ? cat.id : typeof cat === 'number' ? cat : null
                return catId !== null && selectedCategoryIds.includes(catId)
              })
            })
          }

          const limited =
            typeof limit === 'number' && limit > 0 ? filtered.slice(0, limit) : filtered
          setMappedPosts(limited.map(mapPostToCard))
        } catch (err) {
          // ignore aborted
        }
      }
      fetchPosts()
      return () => controller.abort()
    }
  }, [selectedDocs, populateBy, relationTo, limit, selectedCategoryIds])

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={mappedPosts} />
    </div>
  )
}
