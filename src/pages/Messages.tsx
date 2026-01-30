import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getConversations } from '@/db/api';
import { MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Your private conversations
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 bg-muted" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start a conversation by visiting a user's profile
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Card
                key={conv.partner.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => navigate(`/messages/${conv.partner.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      {conv.partner.avatar_url ? (
                        <img src={conv.partner.avatar_url} alt={conv.partner.username} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {conv.partner.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{conv.partner.username || 'Unknown'}</span>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="text-xs">
                            {conv.unreadCount} new
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage.content}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
