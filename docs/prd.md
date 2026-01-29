# Reddit-like Discussion Platform Requirements Document

## 1. Application Overview

### 1.1 Application Name
Community Discussion Platform

### 1.2 Application Description
A general discussion platform similar to Reddit, where users can create posts, engage in discussions, form communities (groups), and interact through comments and voting systems. All posts must be tagged with topic hashtags for better organization and discoverability. The platform includes an admin panel for content moderation and management.

## 2. Core Features

### 2.1 User Authentication
- User registration and login functionality
- Multiple login methods:
  - OSS Google login
  - Email/password login
- All users must be able to authenticate using any of the above methods

### 2.2 Post Management
- Users can create posts with title and content
- Each post must include at least one hashtag topic (e.g., #technology, #gaming, #news)
- Posts support text content
- Users can upvote/downvote posts
- Posts display vote count and comment count

### 2.3 Comment System
- Users can comment on posts
- Support for nested replies to comments
- Users can upvote/downvote comments

### 2.4 Community/Group Management
- Users can create their own groups (similar to subreddits)
- Each group has a name and description
- Users can join/leave groups
- Posts can be published within specific groups

### 2.5 User Profiles
- Display user information
- Show user's post history
- Show user's comment history
- Display groups the user has joined

### 2.6 Content Discovery
- Browse posts by hashtag topics
- Browse posts by groups
- Sort posts by: hot, new, top (most upvoted)
- Search functionality for posts and groups

### 2.7 Admin Panel
- Admin dashboard for platform management
- Admin can view all posts, comments, and users
- Admin can delete inappropriate posts and comments
- Admin can ban/unban users
- Admin can manage groups (delete or modify groups)
- Admin can view platform statistics (total users, posts, comments, groups)

## 3. Functional Requirements

### 3.1 Authentication Flow
- Users must sign up or log in to access the platform
- Support OSS Google login and email/password authentication
- After successful login, users can access all platform features

### 3.2 Post Creation Flow
- User clicks create post button
- User selects target group (optional) or posts to general feed
- User enters post title and content
- User adds at least one hashtag topic (required)
- User submits post

### 3.3 Group Creation Flow
- User clicks create group button
- User enters group name and description
- User submits to create group
- User automatically becomes group member

### 3.4 Interaction Flow
- Users can upvote/downvote posts and comments
- Users can reply to posts via comments
- Users can reply to comments (nested replies)
- Users can join/leave groups

### 3.5 Admin Management Flow
- Admin logs in with admin credentials
- Admin accesses admin panel
- Admin can moderate content (delete posts/comments)
- Admin can manage users (ban/unban)
- Admin can manage groups

## 4. Technical Notes

### 4.1 Authentication
- Implement OSS Google login for Google authentication
- Implement email/password authentication with secure password storage
- Discord OAuth login has been removed

### 4.2 Data Structure
- Posts must include hashtag field (required, can be multiple hashtags)
- Groups have members list
- Posts and comments have vote counts
- Support nested comment structure
- Admin role flag in user data

### 4.3 Netlify Deployment Requirements
- Configure netlify.toml file for build settings
- Set up environment variables in Netlify dashboard for authentication keys and database connections
- Configure redirects for client-side routing
- Set up serverless functions if backend API is needed
- Ensure build command and publish directory are correctly specified