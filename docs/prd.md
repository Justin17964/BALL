# Community Discussion Platform Requirements Document

## 1. Application Overview

### 1.1 Application Name
Community Discussion Platform

### 1.2 Application Description
A general discussion platform similar to Reddit, where users can create posts, engage in discussions, form communities (groups), and interact through comments and voting systems. All posts must be tagged with topic hashtags for better organization and discoverability. Users can send direct messages to each other with online status visibility, and manage their availability status.

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
- Users can set their availability status: Available, Do Not Disturb, or Idle

### 2.3 Post Management
- Users can create posts with title and content
- Each post must include at least one hashtag topic (e.g., #technology, #gaming, #news)
- Posts support text content
- Users can upvote/downvote posts
- Posts display vote count and comment count
- Ensure post submission functionality works correctly

### 2.4 Comment System
- Users can comment on posts
- Support for nested replies to comments
- Users can upvote/downvote comments

### 2.5 Community/Group Management
- Users can create their own groups (similar to subreddits)
- Each group has a name and description
- Users can join/leave groups
- Posts can be published within specific groups
- Group creators can view all group members
- Group creators can set other users as group admins
- Group creators can set groups as private (invite-only) or public

### 2.6 Content Discovery
- Browse posts by hashtag topics
- Browse posts by groups
- Sort posts by: hot, new, top (most upvoted)
- Search functionality for posts and groups

### 2.7 Direct Messaging System
- Users can send direct messages to other users
- Users can view their message inbox and sent messages
- Users can see if the other person is online when private messaging
- User online status is visible during messaging conversations

## 3. Functional Requirements

### 3.1 Authentication Flow
- Users must sign up or log in to access the platform
- Support OSS Google login and email/password authentication
- After successful login, users can access all platform features

### 3.2 Profile Update Flow
- User accesses their profile settings
- User can change their account name
- User can upload and set a logo (profile picture)
- User can set their availability status (Available, Do Not Disturb, or Idle)
- User saves changes

### 3.3 Post Creation Flow
- User clicks create post button
- User selects target group (optional) or posts to general feed
- User enters post title and content
- User adds at least one hashtag topic (required)
- User submits post
- System must properly handle post submission and save to database

### 3.4 Group Creation Flow
- User clicks create group button
- User enters group name and description
- User sets group visibility (public or private)
- User submits to create group
- User automatically becomes group creator and member

### 3.5 Group Management Flow
- Group creator can view list of all group members
- Group creator can assign other users as group admins
- Group creator can change group settings (public/private)
- Group admins have moderation permissions within the group

### 3.6 Interaction Flow
- Users can upvote/downvote posts and comments
- Users can reply to posts via comments
- Users can reply to comments (nested replies)
- Users can join/leave groups
- Users can join private groups only if invited or approved by group creator/admin

### 3.7 Direct Messaging Flow
- User navigates to another user's profile
- User clicks send message button
- User can see if the other person is online
- User composes and sends direct message
- Recipient receives message in their inbox
- Users can view conversation history
- Online status is displayed during messaging

## 4. Technical Notes

### 4.1 Authentication
- Implement OSS Google login for Google authentication
- Implement email/password authentication with secure password storage

### 4.2 Data Structure
- Posts must include hashtag field (required, can be multiple hashtags)
- Groups have members list, creator field, admin list, and visibility setting (public/private)
- Posts and comments have vote counts
- Support nested comment structure
- User profile includes account name, logo fields, and availability status (Available, Do Not Disturb, Idle)
- Direct messages include sender, recipient, content, timestamp, and online status indicator
- User online status tracking for real-time messaging features
- Ensure proper database schema and API endpoints for post creation

### 4.3 Netlify Deployment Requirements
- Configure netlify.toml file for build settings
- Set up environment variables in Netlify dashboard for authentication keys and database connections
- Configure redirects for client-side routing
- Set up serverless functions if backend API is needed
- Ensure build command and publish directory are correctly specified