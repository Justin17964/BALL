import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { VoteButtons } from './VoteButtons';
import { MessageSquare } from 'lucide-react';
import { votePost } from '@/db/api';
import type { PostWithDetails } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: PostWithDetails;
  onVoteUpdate?: () => void;
}

export function PostCard({ post, onVoteUpdate }: PostCardProps) {
  const handleVote = async (voteType: number) => {
    await votePost(post.id, voteType);
    onVoteUpdate?.();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <VoteButtons
            voteCount={post.vote_count}
            userVote={post.user_vote}
            onVote={handleVote}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-muted">
                  {post.author?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Link
                  to={`/profile/${post.author_id}`}
                  className="font-medium hover:underline"
                >
                  {post.author?.username || 'Unknown'}
                </Link>
                {post.group && (
                  <>
                    <span>in</span>
                    <Link
                      to={`/groups/${post.group_id}`}
                      className="font-medium hover:underline"
                    >
                      {post.group.name}
                    </Link>
                  </>
                )}
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            <Link to={`/post/${post.id}`} className="block group">
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-muted-foreground line-clamp-3 mb-3">
                {post.content}
              </p>
            </Link>

            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.hashtags.map((tag) => (
                  <Link key={tag.id} to={`/hashtag/${tag.name}`}>
                    <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                      #{tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link
                to={`/post/${post.id}`}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{post.comment_count} comments</span>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
