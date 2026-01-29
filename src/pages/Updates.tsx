import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { getUpdates } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import type { UpdateWithDetails } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function Updates() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [updates, setUpdates] = useState<UpdateWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const data = await getUpdates();
      setUpdates(data);
    } catch (error) {
      console.error('Failed to load updates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Updates</h1>
            <p className="text-muted-foreground mt-1">
              Latest news and announcements from the team
            </p>
          </div>
          {profile?.role === 'admin' && (
            <Button onClick={() => navigate('/updates/create')} className="gap-2">
              <Plus className="w-4 h-4" />
              Post Update
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 bg-muted" />
            ))}
          </div>
        ) : updates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No updates yet. Check back later!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <Card key={update.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{update.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Posted by {update.author?.username || 'Admin'}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-foreground">{update.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
