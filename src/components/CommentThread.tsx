import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VoteButtons } from './VoteButtons';
import { MessageSquare } from 'lucide-react';
import { voteComment, createComment } from '@/db/api';
import type { CommentWithDetails } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface CommentThreadProps {
  comments: CommentWithDetails[];
  postId: string;
  onCommentAdded?: () => void;
  level?: number;
}

export function CommentThread({ comments, postId, onCommentAdded, level = 0 }: CommentThreadProps) {
  return (
    <div className={level > 0 ? 'ml-8 border-l-2 border-border pl-4' : 'space-y-4'}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          onCommentAdded={onCommentAdded}
          level={level}
        />
      ))}
    </div>
  );
}

interface CommentItemProps {
  comment: CommentWithDetails;
  postId: string;
  onCommentAdded?: () => void;
  level: number;
}

function CommentItem({ comment, postId, onCommentAdded, level }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (voteType: number) => {
    await voteComment(comment.id, voteType);
    onCommentAdded?.();
  };

  const handleReply = async () => {
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createComment(postId, replyContent, comment.id);
      setReplyContent('');
      setIsReplying(false);
      onCommentAdded?.();
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <VoteButtons
          voteCount={comment.vote_count}
          userVote={comment.user_vote}
          onVote={handleVote}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs bg-muted">
                {comment.author?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Link
              to={`/profile/${comment.author_id}`}
              className="font-medium text-sm hover:underline"
            >
              {comment.author?.username || 'Unknown'}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          <p className="text-sm mb-2 whitespace-pre-wrap">{comment.content}</p>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReplying(!isReplying)}
            className="h-7 px-2 text-xs"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Reply
          </Button>

          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <CommentThread
          comments={comment.replies}
          postId={postId}
          onCommentAdded={onCommentAdded}
          level={level + 1}
        />
      )}
    </div>
  );
}
