import type { CardPostData } from '@/custom-payload-types'
import Link from 'next/link'

export const CollectionArchive: React.FC<{
  posts: CardPostData[]
}> = ({ posts }) => {
  return (
    <div className="container">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post.id} className="group">
            {/* ✅ Only one headline — styled and clickable */}
            <Link href={`/posts/${post.slug}`} className="block space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:underline">
                {post.title}
              </h2>

              {/* ✅ Image rendering with fallback alt */}
              {post.meta?.image?.url && (
                <img
                  src={post.meta.image.url}
                  alt={post.meta.image.alt || post.title}
                  className="rounded shadow transition-transform duration-200 group-hover:scale-[1.02]"
                />
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
