import { cn } from '@/utilities/ui'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  // Sort posts by publishedAt descending (most recent first)
  const sortedPosts = [...posts].sort((a, b) => {
    const aDate = (a as any).publishedAt ? new Date((a as any).publishedAt).getTime() : 0
    const bDate = (b as any).publishedAt ? new Date((b as any).publishedAt).getTime() : 0
    return bDate - aDate
  })

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {sortedPosts.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <Card className="h-full" doc={result} relationTo="posts" showCategories />
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}
