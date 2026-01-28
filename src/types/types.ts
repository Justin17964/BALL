export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
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
