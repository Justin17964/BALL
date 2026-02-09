import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getUpdates, createUpdate, updateUpdate, deleteUpdate } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import type { UpdateWithDetails } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [updates, setUpdates] = useState<UpdateWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<UpdateWithDetails | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (profile && profile.role !== 'admin') {
      navigate('/'); // Redirect to Updates page
      return;
    }
    loadUpdates();
  }, [profile, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      if (editingUpdate) {
        await updateUpdate(editingUpdate.id, title.trim(), content.trim());
      } else {
        await createUpdate(title.trim(), content.trim());
      }
      setDialogOpen(false);
      setTitle('');
      setContent('');
      setEditingUpdate(null);
      await loadUpdates();
    } catch (err: any) {
      setError(err.message || 'Failed to save update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (update: UpdateWithDetails) => {
    setEditingUpdate(update);
    setTitle(update.title);
    setContent(update.content);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this update?')) return;

    try {
      await deleteUpdate(id);
      await loadUpdates();
    } catch (error) {
      console.error('Failed to delete update:', error);
    }
  };

  const handleNewUpdate = () => {
    setEditingUpdate(null);
    setTitle('');
    setContent('');
    setError('');
    setDialogOpen(true);
  };

  if (profile?.role !== 'admin') {
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage platform updates and announcements</p>
            </div>
          </div>
          <Button onClick={handleNewUpdate}>
            <Plus className="w-4 h-4 mr-2" />
            New Update
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Updates</CardTitle>
            <CardDescription>
              Create and manage updates that will be visible to all users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2 p-4 border rounded-lg">
                  <Skeleton className="h-6 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-full bg-muted" />
                  <Skeleton className="h-4 w-full bg-muted" />
                </div>
              ))
            ) : updates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No updates yet. Create your first update to inform users about platform changes.
              </div>
            ) : (
              updates.map((update) => (
                <div key={update.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{update.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Posted {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(update)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(update.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{update.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUpdate ? 'Edit Update' : 'Create New Update'}</DialogTitle>
              <DialogDescription>
                {editingUpdate
                  ? 'Update the announcement details below.'
                  : 'Create a new update to inform users about platform changes.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Update title..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Update content..."
                  className="min-h-[150px]"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !title.trim() || !content.trim()}>
                  {submitting ? 'Saving...' : editingUpdate ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
