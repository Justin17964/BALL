export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  banned: boolean;
  banned_at: string | null;
  banned_by: string | null;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface MessageWithDetails extends Message {
  sender?: Profile;
  recipient?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  content_type: 'post' | 'comment' | 'message' | 'user';
  content_id: string | null;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface ReportWithDetails extends Report {
  reporter?: Profile;
  reported_user?: Profile;
  resolver?: Profile;
}

export interface Update {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateWithDetails extends Update {
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  creator_id: string | null;
  member_count: number;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  group_id: string | null;
  vote_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostWithDetails extends Post {
  author?: Profile;
  group?: Group;
  hashtags?: Hashtag[];
  user_vote?: number;
}

export interface Hashtag {
  id: string;
  name: string;
  post_count: number;
  created_at: string;
}

export interface PostHashtag {
  id: string;
  post_id: string;
  hashtag_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_id: string | null;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommentWithDetails extends Comment {
  author?: Profile;
  user_vote?: number;
  replies?: CommentWithDetails[];
}

export interface Vote {
  id: string;
  user_id: string;
  post_id: string | null;
  comment_id: string | null;
  vote_type: number;
  created_at: string;
}

export type SortType = 'hot' | 'new' | 'top';
