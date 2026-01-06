# Reddit-like Discussion Platform Requirements Document

## 1. Application Overview

### 1.1 Application Name
Community Discussion Platform

### 1.2 Application Description
A general discussion platform similar to Reddit, where users can create posts, engage in discussions, form communities (groups), and interact through comments and voting systems. All posts must be tagged with topic hashtags for better organization and discoverability.

## 2. Core Features

### 2.1 User Authentication
- User registration and login functionality
- Multiple login methods:
  - OSS Google login
  - Discord OAuth login
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

## 3. Functional Requirements

### 3.1 Authentication Flow
- Users must sign up or log in to access the platform
- Support OSS Google login, Discord OAuth, and email/password authentication
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

## 4. Technical Notes

### 4.1 Authentication
- Implement OSS Google login for Google authentication
- Implement Discord OAuth for Discord authentication
- Implement email/password authentication with secure password storage

### 4.2 Data Structure
- Posts must include hashtag field (required, can be multiple hashtags)
- Groups have members list
- Posts and comments have vote counts
- Support nested comment structure