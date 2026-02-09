# Total Chatting Application Requirements Document

## 1. Application Overview

### 1.1 Application Name
Total Chatting Application

### 1.2 Application Description
A comprehensive messaging and communication platform where users can connect with others using either their email address or account name. The application focuses on real-time chat functionality, user discovery, creative communities, and seamless communication between users. The platform includes an admin panel for managing updates and communities.

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
- Users can set their availability status: Available, Do Not Disturb, or Idle
- Users can view their own profile

### 2.3 User Discovery
- Users can search for other users by email address
- Users can search for other users by account name
- Display search results with user profiles
- Users can view other users' profiles

### 2.4 Direct Messaging System
- Users can send direct messages to other users by finding them via email or account name
- Real-time chat functionality
- Users can send emojis in chat messages
- Users can send pictures in chat messages
- Users can view their message inbox and sent messages
- Users can see if the other person is online when messaging
- User online status is visible during messaging conversations
- Support for conversation history
- Message notifications for new incoming messages

### 2.5 Chat Management
- Users can view all their active conversations
- Users can start new conversations by searching for users
- Users can delete conversation history
- Display timestamp for each message
- Show read/unread status for messages

### 2.6 Creative Communities
- Users can browse and join creative communities
- Users can participate in community discussions
- Users can view community content and posts
- Users can interact with other community members

### 2.7 Admin Panel
- Admin authentication and access control
- Admin can post updates on the app
- Admin can manage and remove communities
- Admin dashboard for platform management
- Admin can view platform statistics and user activity

### 2.8 App Updates
- Display app updates posted by admin
- Users can view latest updates and announcements
- Update notifications for users

## 3. Functional Requirements

### 3.1 Authentication Flow
- Users must sign up or log in to access the platform
- Support OSS Google login and email/password authentication
- After successful login, users can access all platform features
- Admin login with elevated permissions

### 3.2 Profile Update Flow
- User accesses their profile settings
- User can change their account name
- User can upload and set a logo (profile picture)
- User can set their availability status (Available, Do Not Disturb, or Idle)
- User saves changes

### 3.3 User Search Flow
- User navigates to search/discover section
- User enters email address or account name in search field
- System displays matching users
- User can click on a profile to view details
- User can initiate chat from profile view

### 3.4 Messaging Flow
- User searches for another user by email or account name
- User clicks on the user profile
- User clicks send message or start chat button
- User can see if the other person is online
- User composes and sends message
- User can select and send emojis
- User can select and send pictures
- Recipient receives message in real-time
- Users can view conversation history including text, emojis, and pictures
- Online status is displayed during messaging
- Messages show timestamp and read status

### 3.5 Conversation Management Flow
- User can view list of all active conversations
- User can select a conversation to continue chatting
- User can delete conversations
- User receives notifications for new messages
- Unread messages are highlighted

### 3.6 Creative Communities Flow
- User browses available creative communities
- User joins communities of interest
- User participates in community discussions
- User views community posts and content
- User interacts with community members

### 3.7 Admin Panel Flow
- Admin logs in with admin credentials
- Admin accesses admin dashboard
- Admin creates and posts app updates
- Admin manages creative communities
- Admin removes communities as needed
- Admin views platform analytics

### 3.8 App Updates Flow
- Admin posts new update through admin panel
- Update is published to the platform
- Users receive notification of new update
- Users can view update details in updates section

## 4. Technical Notes

### 4.1 Authentication
- Implement OSS Google login for Google authentication
- Implement email/password authentication with secure password storage
- Implement role-based access control for admin users

### 4.2 Data Structure
- User profile includes account name, email, logo fields, and availability status (Available, Do Not Disturb, Idle)
- Direct messages include sender, recipient, content (text/emoji/picture), timestamp, read status, and online status indicator
- User online status tracking for real-time messaging features
- Conversation threads linking messages between two users
- Search index for email addresses and account names
- Picture messages include image file references
- Creative communities include community name, description, members, and posts
- App updates include title, content, timestamp, and admin author
- Admin users with elevated permissions

### 4.3 Real-time Communication
- Implement real-time messaging functionality
- Support online/offline status updates
- Enable message delivery notifications
- Support read receipts
- Support emoji rendering in messages
- Support picture display in messages

### 4.4 Netlify Deployment Requirements
- Configure netlify.toml file for build settings
- Set up environment variables in Netlify dashboard for authentication keys and database connections
- Configure redirects for client-side routing
- Set up serverless functions for backend API and real-time messaging
- Ensure build command and publish directory are correctly specified