# Reddit-like Discussion Platform Requirements Document

## 1. Application Overview

### 1.1 Application Name
Community Discussion Platform

### 1.2 Application Description
A general discussion platform similar to Reddit, where users can create posts, engage in discussions, form communities (groups), and interact through comments and voting systems. All posts must be tagged with topic hashtags for better organization and discoverability. The platform includes an admin panel for content moderation and management, as well as an updates page where admins can post platform announcements. Users can send direct messages to each other and report inappropriate messages for admin review.

## 2. Core Features

### 2.1 User Authentication
- User registration and login functionality
- Multiple login methods:
  - OSS Google login
  - Email/password login
- All users must be able to authenticate using any of the above methods

### 2.2 User Profile Management
- Users can change their account names
- Users can add a logo (profile picture/avatar)
- Display user information
- Show user's post history
- Show user's comment history
- Display groups the user has joined

### 2.3 Post Management
- Users can create posts with title and content
- Each post must include at least one hashtag topic (e.g., #technology, #gaming, #news)
- Posts support text content
- Users can upvote/downvote posts
- Posts display vote count and comment count

### 2.4 Comment System
- Users can comment on posts
- Support for nested replies to comments
- Users can upvote/downvote comments

### 2.5 Community/Group Management
- Users can create their own groups (similar to subreddits)
- Each group has a name and description
- Users can join/leave groups
- Posts can be published within specific groups

### 2.6 Content Discovery
- Browse posts by hashtag topics
- Browse posts by groups
- Sort posts by: hot, new, top (most upvoted)
- Search functionality for posts and groups

### 2.7 Direct Messaging System
- Users can send direct messages to other users
- Users can view their message inbox and sent messages
- Users can report inappropriate messages

### 2.8 Message Reporting System
- Users can report messages they receive
- Reported messages include reporter information and reason
- Reported messages appear in admin dashboard for review

### 2.9 Admin Panel
- Admin dashboard for platform management
- Admin can view all posts, comments, and users
- Admin can delete any user's posts and comments
- Admin can ban/unban users
- Admin can manage groups (delete or modify groups)
- Admin can view platform statistics (total users, posts, comments, groups)
- Admin can view reported messages
- Admin can ban users based on reported messages

### 2.10 Updates Page
- Dedicated page for platform updates and announcements
- Admin can post updates to this page
- All users can view updates
- Updates are displayed in chronological order

## 3. Functional Requirements

### 3.1 Authentication Flow
- Users must sign up or log in to access the platform
- Support OSS Google login and email/password authentication
- After successful login, users can access all platform features

### 3.2 Profile Update Flow
- User accesses their profile settings
- User can change their account name
- User can upload and set a logo (profile picture)
- User saves changes

### 3.3 Post Creation Flow
- User clicks create post button
- User selects target group (optional) or posts to general feed
- User enters post title and content
- User adds at least one hashtag topic (required)
- User submits post

### 3.4 Group Creation Flow
- User clicks create group button
- User enters group name and description
- User submits to create group
- User automatically becomes group member

### 3.5 Interaction Flow
- Users can upvote/downvote posts and comments
- Users can reply to posts via comments
- Users can reply to comments (nested replies)
- Users can join/leave groups

### 3.6 Direct Messaging Flow
- User navigates to another user's profile
- User clicks send message button
- User composes and sends direct message
- Recipient receives message in their inbox
- Users can view conversation history

### 3.7 Message Reporting Flow
- User receives an inappropriate message
- User clicks report button on the message
- User submits report (optionally with reason)
- Reported message appears in admin dashboard
- Admin reviews reported message and can take action (ban user if necessary)

### 3.8 Admin Management Flow
- Admin logs in with admin credentials
- Admin accesses admin panel
- Admin can moderate content (delete any user's posts/comments)
- Admin can manage users (ban/unban)
- Admin can manage groups
- Admin can view and review reported messages
- Admin can ban users based on reported messages
- Admin can post updates to the updates page

### 3.9 Updates Page Flow
- Users navigate to the updates page
- Users view all platform updates posted by admin
- Admin can create new updates with title and content
- Updates are displayed in reverse chronological order (newest first)

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
- User profile includes account name and logo fields
- Updates have title, content, timestamp, and admin author fields
- Direct messages include sender, recipient, content, and timestamp
- Reported messages include message content, reporter, reported user, reason, and timestamp

### 4.3 Netlify Deployment Requirements
- Configure netlify.toml file for build settings
- Set up environment variables in Netlify dashboard for authentication keys and database connections
- Configure redirects for client-side routing
- Set up serverless functions if backend API is needed
- Ensure build command and publish directory are correctly specified