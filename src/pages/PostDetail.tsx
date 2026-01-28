import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { VoteButtons } from '@/components/VoteButtons';
import { CommentThread } from '@/components/CommentThread';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { getPost, getComments, createComment, votePost, getUserVote, deletePost } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import type { PostWithDetails, CommentWithDetails } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [comments, setComments] = useState<CommentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPostAndComments = async () => {
    if (!postId) return;

    setLoading(true);
    try {
      const [postData, commentsData] = await Promise.all([
        getPost(postId),
        getComments(postId),
      ]);

      if (postData) {
        const userVote = await getUserVote(postData.id);
        setPost({ ...postData, user_vote: userVote });
      }

      const commentsWithVotes = await Promise.all(
        commentsData.map(async (comment) => {
          const userVote = await getUserVote(undefined, comment.id);
          return { ...comment, user_vote: userVote };
        })
      );

      setComments(commentsWithVotes);
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostAndComments();
  }, [postId]);

  const handleVote = async (voteType: number) => {
    if (!postId) return;
    await votePost(postId, voteType);
    loadPostAndComments();
  };

  const handleComment = async () => {
    if (!commentContent.trim() || !postId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createComment(postId, commentContent);
      setCommentContent('');
      loadPostAndComments();
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!postId) return;
    try {
      await deletePost(postId);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          <Skeleton className="h-96 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-4 md:p-6 text-center">
          <p className="text-muted-foreground">Post not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <VoteButtons
                voteCount={post.vote_count}
                userVote={post.user_vote}
                onVote={handleVote}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-muted">
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

                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

                <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>

                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.hashtags.map((tag) => (
                      <Link key={tag.id} to={`/hashtag/${tag.name}`}>
                        <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                          #{tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}

                {user?.id === post.author_id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete Post
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this post? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Add a Comment</h2>
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="What are your thoughts?"
              className="min-h-[100px]"
            />
            <Button
              onClick={handleComment}
              disabled={!commentContent.trim() || isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </CardContent>
        </Card>

        {comments.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">{comments.length} Comments</h2>
              <CommentThread
                comments={comments}
                postId={post.id}
                onCommentAdded={loadPostAndComments}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
