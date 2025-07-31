import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import React from 'react';
import RichText from '@/components/RichText';
import { CollectionArchive } from '@/components/CollectionArchive';
import { mapPostToCard } from '@utils/mapPostToCard'; // Ensure this path matches tsconfig.json

export const ArchiveBlock: React.FC<ArchiveBlockProps & { id?: string }> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props;
  const limit = limitFromProps || 3;

  let posts: Post[] = [];

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise });
    const flattenedCategories = categories?.map((cat) => (typeof cat === 'object' ? cat.id : cat)) || [];
    const fetchedPosts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit,
      ...(flattenedCategories.length > 0 ? { where: { categories: { in: flattenedCategories } } } : {}),
    });
    posts = fetchedPosts.docs;
  } else if (selectedDocs?.length) {
    posts = selectedDocs
      .map((doc) => (typeof doc.value === 'object' ? doc.value : null))
      .filter((doc): doc is Post => doc !== null);
  }

  // Map Post[] to CardPostData[], ensuring all required fields
  const mappedPosts = posts.map((post) => mapPostToCard(post));

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={mappedPosts} />
    </div>
  );
};