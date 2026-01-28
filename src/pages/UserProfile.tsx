import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileText, MessageSquare, Users } from 'lucide-react';
import { getUserProfile, getUserPosts, getUserComments, getUserGroups, getUserVote } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile, PostWithDetails, Group } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.id === userId;

  const loadUserData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [profileData, postsData, commentsData, groupsData] = await Promise.all([
        getUserProfile(userId),
        getUserPosts(userId),
        getUserComments(userId),
        getUserGroups(userId),
      ]);

      setProfile(profileData);
      setComments(commentsData);
      setGroups(groupsData);

      const postsWithVotes = await Promise.all(
        postsData.map(async (post) => {
          const userVote = await getUserVote(post.id);
          return { ...post, user_vote: userVote };
        })
      );

      setPosts(postsWithVotes);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          <Skeleton className="h-48 bg-muted" />
          <Skeleton className="h-96 bg-muted" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-4 md:p-6 text-center">
          <p className="text-muted-foreground">User not found</p>
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
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-1">{profile.username || 'Unknown User'}</CardTitle>
                {profile.bio && (
                  <p className="text-muted-foreground mb-2">{profile.bio}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{posts.length} posts</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>{comments.length} comments</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{groups.length} groups</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4 mt-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} onVoteUpdate={loadUserData} />
              ))
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-6">
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No comments yet</p>
              </div>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <Link to={`/post/${comment.post_id}`} className="block">
                      <p className="text-sm text-muted-foreground mb-2">
                        Commented on: <span className="font-medium text-foreground">{comment.post?.title}</span>
                      </p>
                      <p className="text-sm mb-2">{comment.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4 mt-6">
            {groups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Not a member of any groups yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group) => (
                  <Link key={group.id} to={`/groups/${group.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {group.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{group.member_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{group.post_count}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
