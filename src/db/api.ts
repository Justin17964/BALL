import { supabase } from './supabase';
import type { Post, PostWithDetails, Comment, CommentWithDetails, Group, Hashtag, SortType, Profile } from '@/types';

// Posts API
export async function getPosts(sortBy: SortType = 'hot', groupId?: string, hashtagName?: string) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, username, avatar_url),
      group:groups(id, name)
    `);

  if (groupId) {
    query = query.eq('group_id', groupId);
  }

  if (hashtagName) {
    const { data: hashtagData } = await supabase
      .from('hashtags')
      .select('id')
      .eq('name', hashtagName)
      .maybeSingle();

    if (hashtagData) {
      const { data: postIds } = await supabase
        .from('post_hashtags')
        .select('post_id')
        .eq('hashtag_id', hashtagData.id);

      if (postIds && postIds.length > 0) {
        query = query.in('id', postIds.map(p => p.post_id));
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  if (sortBy === 'new') {
    query = query.order('created_at', { ascending: false });
  } else if (sortBy === 'top') {
    query = query.order('vote_count', { ascending: false });
  } else {
    query = query.order('vote_count', { ascending: false }).order('created_at', { ascending: false });
  }

  query = query.limit(50);

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getPost(postId: string): Promise<PostWithDetails | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, username, avatar_url),
      group:groups(id, name)
    `)
    .eq('id', postId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { data: hashtagData } = await supabase
    .from('post_hashtags')
    .select('hashtag_id, hashtags(id, name, post_count)')
    .eq('post_id', postId);

  const hashtags = hashtagData?.map(h => (h as any).hashtags).filter(Boolean) as Hashtag[] || [];

  return { ...data, hashtags };
}

export async function createPost(title: string, content: string, hashtags: string[], groupId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      title,
      content,
      author_id: user.id,
      group_id: groupId || null,
    })
    .select()
    .single();

  if (postError) throw postError;

  for (const tagName of hashtags) {
    const cleanTag = tagName.toLowerCase().trim();
    
    let { data: hashtag } = await supabase
      .from('hashtags')
      .select('id')
      .eq('name', cleanTag)
      .maybeSingle();

    if (!hashtag) {
      const { data: newHashtag } = await supabase
        .from('hashtags')
        .insert({ name: cleanTag })
        .select()
        .single();
      hashtag = newHashtag;
    }

    if (hashtag) {
      await supabase
        .from('post_hashtags')
        .insert({ post_id: post.id, hashtag_id: hashtag.id });

      await supabase
        .from('hashtags')
        .update({ post_count: supabase.rpc('increment', { x: 1 }) })
        .eq('id', hashtag.id);
    }
  }

  if (groupId) {
    await supabase.rpc('increment_group_post_count', { group_id: groupId });
  }

  return post;
}

export async function deletePost(postId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or post author
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const { data: post } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single();

  if (!profile || !post) throw new Error('Post not found');

  // Allow deletion if user is admin or post author
  if (profile.role !== 'admin' && post.author_id !== user.id) {
    throw new Error('Not authorized to delete this post');
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}

export async function getUserVote(postId?: string, commentId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase
    .from('votes')
    .select('vote_type')
    .eq('user_id', user.id);

  if (postId) {
    query = query.eq('post_id', postId);
  } else if (commentId) {
    query = query.eq('comment_id', commentId);
  }

  const { data } = await query.maybeSingle();
  return data?.vote_type || null;
}

export async function votePost(postId: string, voteType: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .maybeSingle();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id);

      await supabase
        .from('posts')
        .update({ vote_count: supabase.rpc('decrement_vote', { current_count: 0, vote: voteType }) })
        .eq('id', postId);
    } else {
      await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);

      await supabase
        .from('posts')
        .update({ vote_count: supabase.rpc('change_vote', { current_count: 0, old_vote: existingVote.vote_type, new_vote: voteType }) })
        .eq('id', postId);
    }
  } else {
    await supabase
      .from('votes')
      .insert({ user_id: user.id, post_id: postId, vote_type: voteType });

    const { data: post } = await supabase
      .from('posts')
      .select('vote_count')
      .eq('id', postId)
      .single();

    await supabase
      .from('posts')
      .update({ vote_count: (post?.vote_count || 0) + voteType })
      .eq('id', postId);
  }
}

// Comments API
export async function getComments(postId: string): Promise<CommentWithDetails[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_author_id_fkey(id, username, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const comments = Array.isArray(data) ? data : [];
  
  const buildTree = (parentId: string | null): CommentWithDetails[] => {
    return comments
      .filter(c => c.parent_id === parentId)
      .map(c => ({
        ...c,
        replies: buildTree(c.id),
      }));
  };

  return buildTree(null);
}

export async function createComment(postId: string, content: string, parentId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      content,
      author_id: user.id,
      post_id: postId,
      parent_id: parentId || null,
    })
    .select()
    .single();

  if (error) throw error;

  const { data: post } = await supabase
    .from('posts')
    .select('comment_count')
    .eq('id', postId)
    .single();

  await supabase
    .from('posts')
    .update({ comment_count: (post?.comment_count || 0) + 1 })
    .eq('id', postId);

  return data;
}

export async function voteComment(commentId: string, voteType: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .maybeSingle();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id);

      const { data: comment } = await supabase
        .from('comments')
        .select('vote_count')
        .eq('id', commentId)
        .single();

      await supabase
        .from('comments')
        .update({ vote_count: (comment?.vote_count || 0) - voteType })
        .eq('id', commentId);
    } else {
      await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);

      const { data: comment } = await supabase
        .from('comments')
        .select('vote_count')
        .eq('id', commentId)
        .single();

      await supabase
        .from('comments')
        .update({ vote_count: (comment?.vote_count || 0) - existingVote.vote_type + voteType })
        .eq('id', commentId);
    }
  } else {
    await supabase
      .from('votes')
      .insert({ user_id: user.id, comment_id: commentId, vote_type: voteType });

    const { data: comment } = await supabase
      .from('comments')
      .select('vote_count')
      .eq('id', commentId)
      .single();

    await supabase
      .from('comments')
      .update({ vote_count: (comment?.vote_count || 0) + voteType })
      .eq('id', commentId);
  }
}

// Groups API
export async function getGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('member_count', { ascending: false })
    .limit(50);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getGroup(groupId: string) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createGroup(name: string, description: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name,
      description,
      creator_id: user.id,
    })
    .select()
    .single();

  if (groupError) throw groupError;

  await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: user.id,
    });

  return group;
}

export async function joinGroup(groupId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: user.id,
    });

  if (error) throw error;

  const { data: group } = await supabase
    .from('groups')
    .select('member_count')
    .eq('id', groupId)
    .single();

  await supabase
    .from('groups')
    .update({ member_count: (group?.member_count || 0) + 1 })
    .eq('id', groupId);
}

export async function leaveGroup(groupId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  if (error) throw error;

  const { data: group } = await supabase
    .from('groups')
    .select('member_count')
    .eq('id', groupId)
    .single();

  await supabase
    .from('groups')
    .update({ member_count: Math.max(0, (group?.member_count || 0) - 1) })
    .eq('id', groupId);
}

export async function isGroupMember(groupId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .maybeSingle();

  return !!data;
}

// Hashtags API
export async function getTrendingHashtags(limit = 20) {
  const { data, error } = await supabase
    .from('hashtags')
    .select('*')
    .order('post_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// User Profile API
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getUserPosts(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, username, avatar_url),
      group:groups(id, name)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getUserComments(userId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_author_id_fkey(id, username, avatar_url),
      post:posts(id, title)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getUserGroups(userId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select('group:groups(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return Array.isArray(data) ? data.map(d => (d as any).group).filter(Boolean) : [];
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  await updateProfile(userId, { avatar_url: publicUrl });

  return publicUrl;
}

// Messages API
export async function getConversations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get unique conversations
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, username, avatar_url),
      recipient:profiles!messages_recipient_id_fkey(id, username, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Group by conversation partner
  const conversationsMap = new Map();
  data?.forEach((msg: any) => {
    const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
    if (!conversationsMap.has(partnerId)) {
      conversationsMap.set(partnerId, {
        partner: msg.sender_id === user.id ? msg.recipient : msg.sender,
        lastMessage: msg,
        unreadCount: 0,
      });
    }
    if (!msg.read && msg.recipient_id === user.id) {
      conversationsMap.get(partnerId).unreadCount++;
    }
  });

  return Array.from(conversationsMap.values());
}

export async function getMessages(otherUserId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, username, avatar_url),
      recipient:profiles!messages_recipient_id_fkey(id, username, avatar_url)
    `)
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function sendMessage(recipientId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markMessagesAsRead(otherUserId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('sender_id', otherUserId)
    .eq('recipient_id', user.id)
    .eq('read', false);

  if (error) throw error;
}

// Reports API
export async function createReport(
  contentType: 'post' | 'comment' | 'message' | 'user',
  contentId: string | null,
  reportedUserId: string | null,
  reason: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      content_type: contentType,
      content_id: contentId,
      reason,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReports(status?: string) {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(id, username, avatar_url),
      reported_user:profiles!reports_reported_user_id_fkey(id, username, avatar_url),
      resolver:profiles!reports_resolved_by_fkey(id, username)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  let result = Array.isArray(data) ? data : [];
  if (status) {
    result = result.filter(r => r.status === status);
  }
  return result;
}

export async function updateReportStatus(
  reportId: string,
  status: 'reviewed' | 'resolved' | 'dismissed',
  adminNotes?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('reports')
    .update({
      status,
      admin_notes: adminNotes,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) throw error;
}

// Search API
export async function searchPosts(query: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, username, avatar_url),
      group:groups(id, name)
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function searchGroups(query: string) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('member_count', { ascending: false })
    .limit(50);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}
