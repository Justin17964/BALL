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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAllProfiles, updateUserRole, getPosts, deletePost, getReports, updateReportStatus, banUser, unbanUser } from '@/db/api';
import type { Profile, PostWithDetails, ReportWithDetails } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Search, Ban, ShieldOff } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export default function Admin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [banReason, setBanReason] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportWithDetails | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
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
      const [profilesData, postsData, reportsData] = await Promise.all([
        getAllProfiles(),
        getPosts('new'),
        getReports(),
      ]);
      setProfiles(profilesData);
      setFilteredProfiles(profilesData);
      setPosts(postsData);
      setReports(reportsData);
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

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) return;
    try {
      await banUser(selectedUser.id, banReason);
      setBanDialogOpen(false);
      setBanReason('');
      setSelectedUser(null);
      await loadData();
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId);
      await loadData();
    } catch (error) {
      console.error('Failed to unban user:', error);
      alert('Failed to unban user');
    }
  };

  const handleReportAction = async (status: 'reviewed' | 'resolved' | 'dismissed') => {
    if (!selectedReport) return;
    try {
      await updateReportStatus(selectedReport.id, status, adminNotes);
      setReportDialogOpen(false);
      setAdminNotes('');
      setSelectedReport(null);
      await loadData();
    } catch (error) {
      console.error('Failed to update report:', error);
      alert('Failed to update report');
    }
  };

  const openBanDialog = (user: Profile) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const openReportDialog = (report: ReportWithDetails) => {
    setSelectedReport(report);
    setAdminNotes(report.admin_notes || '');
    setReportDialogOpen(true);
  };

  const stats = {
    totalUsers: profiles.length,
    totalAdmins: profiles.filter(p => p.role === 'admin').length,
    totalPosts: posts.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    bannedUsers: profiles.filter(p => p.banned).length,
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.pendingReports}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Banned Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.bannedUsers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="posts">Content Moderation</TabsTrigger>
            <TabsTrigger value="reports">
              Reports {stats.pendingReports > 0 && `(${stats.pendingReports})`}
            </TabsTrigger>
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
                          <TableHead>Status</TableHead>
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
                            <TableCell>
                              {profile.banned ? (
                                <Badge variant="destructive">Banned</Badge>
                              ) : (
                                <Badge variant="outline">Active</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={profile.role}
                                  onValueChange={(value) => handleRoleChange(profile.id, value as 'user' | 'admin')}
                                  disabled={updating === profile.id || profile.banned}
                                >
                                  <SelectTrigger className="w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                {profile.banned ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnbanUser(profile.id)}
                                  >
                                    <ShieldOff className="w-4 h-4 mr-1" />
                                    Unban
                                  </Button>
                                ) : (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => openBanDialog(profile)}
                                  >
                                    <Ban className="w-4 h-4 mr-1" />
                                    Ban
                                  </Button>
                                )}
                              </div>
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

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 bg-muted" />
                    ))}
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reports found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <Card key={report.id} className="border-l-4" style={{
                        borderLeftColor: report.status === 'pending' ? 'hsl(var(--destructive))' : 
                                       report.status === 'resolved' ? 'hsl(var(--primary))' : 
                                       'hsl(var(--muted))'
                      }}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  report.status === 'pending' ? 'destructive' :
                                  report.status === 'resolved' ? 'default' :
                                  'secondary'
                                }>
                                  {report.status}
                                </Badge>
                                <Badge variant="outline">{report.content_type}</Badge>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Reported by <span className="font-medium">{report.reporter?.username || 'Unknown'}</span>
                                  {report.reported_user && (
                                    <> against <span className="font-medium">{report.reported_user.username || 'Unknown'}</span></>
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                </p>
                              </div>
                              <p className="text-sm">{report.reason}</p>
                              {report.admin_notes && (
                                <div className="bg-muted p-3 rounded-md">
                                  <p className="text-xs font-medium mb-1">Admin Notes:</p>
                                  <p className="text-sm">{report.admin_notes}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReportDialog(report)}
                              >
                                Review
                              </Button>
                              {report.reported_user && !report.reported_user.banned && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => openBanDialog(report.reported_user!)}
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  Ban User
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ban User Dialog */}
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
              <DialogDescription>
                Ban {selectedUser?.username}? They will no longer be able to access the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ban-reason">Reason *</Label>
                <Textarea
                  id="ban-reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Provide a reason for banning this user..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBanUser} disabled={!banReason.trim()}>
                Ban User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Review Dialog */}
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Report</DialogTitle>
              <DialogDescription>
                Review and take action on this report
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Report Details:</p>
                  <p className="text-sm text-muted-foreground">{selectedReport.reason}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Admin Notes</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={() => handleReportAction('dismissed')}>
                Dismiss
              </Button>
              <Button variant="default" onClick={() => handleReportAction('resolved')}>
                Resolve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
