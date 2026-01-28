import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { PostCard } from '@/components/PostCard';
import { SortTabs } from '@/components/SortTabs';
import { Skeleton } from '@/components/ui/skeleton';
import { getPosts, getUserVote } from '@/db/api';
import type { PostWithDetails, SortType } from '@/types';

export default function Home() {
  const { hashtag } = useParams();
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortType>('hot');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getPosts(sortBy, undefined, hashtag);
      
      const postsWithVotes = await Promise.all(
        data.map(async (post) => {
          const userVote = await getUserVote(post.id);
          return { ...post, user_vote: userVote };
        })
      );

      setPosts(postsWithVotes);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [sortBy, hashtag]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {hashtag ? `#${hashtag}` : 'Home Feed'}
          </h1>
          <SortTabs value={sortBy} onChange={setSortBy} />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 bg-muted" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found. Be the first to post!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onVoteUpdate={loadPosts} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
