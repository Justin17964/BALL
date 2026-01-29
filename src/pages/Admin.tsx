import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getAllProfiles, updateUserRole, getPosts, deletePost } from '@/db/api';
import type { Profile, PostWithDetails } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export default function Admin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      const filtered = profiles.filter(p => 
        p.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(profiles);
    }
  }, [debouncedSearch, profiles]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profilesData, postsData] = await Promise.all([
        getAllProfiles(),
        getPosts('new'),
      ]);
      setProfiles(profilesData);
      setFilteredProfiles(profilesData);
      setPosts(postsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    setUpdating(userId);
    try {
      await updateUserRole(userId, newRole);
      await loadData();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const stats = {
    totalUsers: profiles.length,
    totalAdmins: profiles.filter(p => p.role === 'admin').length,
    totalPosts: posts.length,
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and content across Creative Communities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAdmins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalPosts}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="posts">Content Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by username or email..."
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 bg-muted" />
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProfiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">{profile.username || 'Unknown'}</TableCell>
                            <TableCell className="text-muted-foreground">{profile.email || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                                {profile.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={profile.role}
                                onValueChange={(value) => handleRoleChange(profile.id, value as 'user' | 'admin')}
                                disabled={updating === profile.id}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Review and manage posts across the platform
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 bg-muted" />
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No posts to moderate
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 truncate">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>By {post.author?.username || 'Unknown'}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                            <span>•</span>
                            <span>{post.vote_count} votes</span>
                            <span>•</span>
                            <span>{post.comment_count} comments</span>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Post</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this post? This action cannot be undone and will also delete all comments.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
