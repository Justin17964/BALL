import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash } from 'lucide-react';
import { getTrendingHashtags } from '@/db/api';
import { Link } from 'react-router-dom';
import type { Hashtag } from '@/types';

export default function Trending() {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHashtags();
  }, []);

  const loadHashtags = async () => {
    setLoading(true);
    try {
      const data = await getTrendingHashtags(50);
      setHashtags(data);
    } catch (error) {
      console.error('Failed to load hashtags:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <h1 className="text-3xl font-bold">Trending Hashtags</h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 bg-muted" />
            ))}
          </div>
        ) : hashtags.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hashtags yet. Create a post with hashtags!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hashtags.map((hashtag, index) => (
              <Link key={hashtag.id} to={`/hashtag/${hashtag.name}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Hash className="w-5 h-5 text-muted-foreground" />
                          <h3 className="font-bold text-lg">{hashtag.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {hashtag.post_count} {hashtag.post_count === 1 ? 'post' : 'posts'}
                        </p>
                      </div>
                      <Badge variant="secondary">{hashtag.post_count}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
