# Task: Build Reddit-like Discussion Platform

## Plan
- [ ] Step 1: Initialize Supabase and setup database schema
  - [x] Initialize Supabase
  - [x] Create database tables (profiles, posts, comments, votes, groups, group_members, post_hashtags)
  - [x] Setup RLS policies
  - [x] Create helper functions
- [x] Step 2: Update design system with Reddit-like color scheme
- [x] Step 3: Create type definitions
- [x] Step 4: Create database API layer
- [x] Step 5: Update authentication context for Google SSO and Discord OAuth
- [x] Step 6: Create layout components (AppLayout with sidebar)
- [x] Step 7: Create reusable UI components (PostCard, CommentThread, VoteButtons, etc.)
- [x] Step 8: Create pages (Home, PostDetail, CreatePost, Groups, GroupDetail, CreateGroup, UserProfile, Login, Admin)
- [x] Step 9: Setup routing and update App.tsx
- [x] Step 10: Run lint and fix any issues

## Notes
- Using username + password, Google SSO, and Discord OAuth for authentication
- All posts require at least one hashtag
- Nested comment system with voting
- Group-based communities
- First user becomes admin automatically
