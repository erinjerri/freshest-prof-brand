import type { Post } from '@/payload-types'

import type { CardPostData } from '@/custom-payload-types'

export const CollectionArchive: React.FC<{
  posts: CardPostData[]
}> = ({ posts }) => {
  return (
    <div className="container">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post.id}>
            <h2>{post.title}</h2>
            <p>Slug: {post.slug}</p>
            {/* Add more rendering logic as needed */}
          </div>
        ))}
      </div>
    </div>
  )
}
