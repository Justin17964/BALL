import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { PostCard } from '@/components/PostCard';
import { SortTabs } from '@/components/SortTabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Users, FileText } from 'lucide-react';
import { getGroup, getPosts, isGroupMember, joinGroup, leaveGroup, getUserVote } from '@/db/api';
import type { Group, PostWithDetails, SortType } from '@/types';

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortType>('hot');
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const loadGroupData = async () => {
    if (!groupId) return;

    setLoading(true);
    try {
      const [groupData, postsData, memberStatus] = await Promise.all([
        getGroup(groupId),
        getPosts(sortBy, groupId),
        isGroupMember(groupId),
      ]);

      setGroup(groupData);
      setIsMember(memberStatus);

      const postsWithVotes = await Promise.all(
        postsData.map(async (post) => {
          const userVote = await getUserVote(post.id);
          return { ...post, user_vote: userVote };
        })
      );

      setPosts(postsWithVotes);
    } catch (error) {
      console.error('Failed to load group:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupData();
  }, [groupId, sortBy]);

  const handleJoinLeave = async () => {
    if (!groupId || isJoining) return;

    setIsJoining(true);
    try {
      if (isMember) {
        await leaveGroup(groupId);
      } else {
        await joinGroup(groupId);
      }
      loadGroupData();
    } catch (error) {
      console.error('Failed to join/leave group:', error);
    } finally {
      setIsJoining(false);
    }
  };

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

  if (!group) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-4 md:p-6 text-center">
          <p className="text-muted-foreground">Group not found</p>
          <Button onClick={() => navigate('/groups')} className="mt-4">
            Browse Groups
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate('/groups')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{group.name}</CardTitle>
                <p className="text-muted-foreground">{group.description || 'No description'}</p>
              </div>
              <Button
                onClick={handleJoinLeave}
                disabled={isJoining}
                variant={isMember ? 'outline' : 'default'}
              >
                {isJoining ? 'Loading...' : isMember ? 'Leave Group' : 'Join Group'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{group.member_count} members</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{group.post_count} posts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Posts</h2>
          <SortTabs value={sortBy} onChange={setSortBy} />
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts in this group yet. Be the first to post!</p>
            <Button onClick={() => navigate('/create-post')} className="mt-4">
              Create Post
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onVoteUpdate={loadGroupData} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
