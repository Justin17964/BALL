import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getMessages, sendMessage, markMessagesAsRead, getUserProfile, createReport } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import type { MessageWithDetails, Profile } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Send, MoreVertical, Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function Conversation() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithDetails[]>([]);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      loadConversation();
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [messagesData, userData] = await Promise.all([
        getMessages(userId),
        getUserProfile(userId),
      ]);
      setMessages(messagesData);
      setOtherUser(userData);
      await markMessagesAsRead(userId);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || sending) return;

    setSending(true);
    try {
      await sendMessage(userId, newMessage.trim());
      setNewMessage('');
      await loadConversation();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleReportMessage = (messageId: string) => {
    setReportingMessageId(messageId);
    setReportDialogOpen(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim() || !reportingMessageId || !userId) return;

    try {
      await createReport('message', reportingMessageId, userId, reportReason);
      setReportDialogOpen(false);
      setReportReason('');
      setReportingMessageId(null);
      alert('Report submitted successfully');
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <Skeleton className="h-96 bg-muted" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card className="flex flex-col h-[calc(100vh-12rem)]">
          <CardHeader className="border-b">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/messages')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Avatar className="w-10 h-10">
                {otherUser?.avatar_url ? (
                  <img src={otherUser.avatar_url} alt={otherUser.username || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {otherUser?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <CardTitle className="flex-1">{otherUser?.username || 'Unknown User'}</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="w-8 h-8">
                      {message.sender?.avatar_url ? (
                        <img src={message.sender.avatar_url} alt={message.sender.username || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {message.sender?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className={`flex-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                        {!isOwn && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleReportMessage(message.id)}>
                                <Flag className="w-4 h-4 mr-2" />
                                Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
              />
              <Button type="submit" disabled={!newMessage.trim() || sending}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Message</DialogTitle>
            <DialogDescription>
              Please provide a reason for reporting this message. Our moderators will review it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe why you're reporting this message..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReport} disabled={!reportReason.trim()}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
