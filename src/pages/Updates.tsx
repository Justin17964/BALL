import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getUpdates } from '@/db/api';
import type { UpdateWithDetails } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Megaphone } from 'lucide-react';

export default function Updates() {
  const [updates, setUpdates] = useState<UpdateWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      const data = await getUpdates();
      setUpdates(data as UpdateWithDetails[]);
    } catch (error) {
      console.error('Failed to load updates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Platform Updates</h1>
            <p className="text-sm text-muted-foreground">
              Stay informed about the latest changes and announcements
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full bg-muted mb-2" />
                  <Skeleton className="h-4 w-full bg-muted mb-2" />
                  <Skeleton className="h-4 w-2/3 bg-muted" />
                </CardContent>
              </Card>
            ))
          ) : updates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No updates yet. Check back later for announcements.
                </p>
              </CardContent>
            </Card>
          ) : (
            updates.map((update) => (
              <Card key={update.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{update.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="w-6 h-6">
                          {update.author.avatar_url ? (
                            <img
                              src={update.author.avatar_url}
                              alt={update.author.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {update.author.username?.[0]?.toUpperCase() || 'A'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span>{update.author.username}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{update.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
