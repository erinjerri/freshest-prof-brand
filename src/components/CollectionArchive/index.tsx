import type { CardPostData } from '@/custom-payload-types'
import { Card } from '@/components/Card'

export const CollectionArchive: React.FC<{
  posts: CardPostData[]
}> = ({ posts }) => {
  return (
    <div className="container">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card
            key={post.id}
            doc={post}
            relationTo="posts"
            showCategories
            className="h-full hover:border-[#1C8FDA] transition-colors"
          />
        ))}
      </div>
    </div>
  )
}
