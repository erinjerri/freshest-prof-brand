'use client'

import type { ArchiveBlock as ArchiveBlockProps } from '@/payload-types'
import React, { useEffect, useState } from 'react'
import RichText from '@/components/RichText'
import { CollectionArchive } from '@/components/CollectionArchive'
import { mapPostToCard } from '@utils/mapPostToCard'

export const ArchiveBlock: React.FC<ArchiveBlockProps & { id?: string }> = (props) => {
  const { id, introContent, selectedDocs = [] } = props

  const [mappedPosts, setMappedPosts] = useState([])

  useEffect(() => {
    const posts = selectedDocs
      .map((doc) => (typeof doc.value === 'object' ? doc.value : null))
      .filter((doc): doc is any => doc !== null)

    setMappedPosts(posts.map(mapPostToCard))
  }, [selectedDocs])

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
