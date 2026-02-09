import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import CreateGroup from './pages/CreateGroup';
import Trending from './pages/Trending';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import FindUsers from './pages/FindUsers';
import Login from './pages/Login';
import AuthDebug from './pages/AuthDebug';
import Admin from './pages/Admin';
import Updates from './pages/Updates';
import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Updates',
    path: '/',
    element: <Updates />
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <Admin />
  },
  {
    name: 'Messages',
    path: '/messages',
    element: <Messages />
  },
  {
    name: 'Find Users',
    path: '/find-users',
    element: <FindUsers />
  },
  {
    name: 'Conversation',
    path: '/messages/:userId',
    element: <Conversation />
  },
  {
    name: 'Posts',
    path: '/posts',
    element: <Home />
  },
  {
    name: 'Post Detail',
    path: '/post/:postId',
    element: <PostDetail />
  },
  {
    name: 'Create Post',
    path: '/create-post',
    element: <CreatePost />
  },
  {
    name: 'Groups',
    path: '/groups',
    element: <Groups />
  },
  {
    name: 'Group Detail',
    path: '/groups/:groupId',
    element: <GroupDetail />
  },
  {
    name: 'Create Group',
    path: '/create-group',
    element: <CreateGroup />
  },
  {
    name: 'Trending',
    path: '/trending',
    element: <Trending />
  },
  {
    name: 'Hashtag',
    path: '/hashtag/:hashtag',
    element: <Home />
  },
  {
    name: 'User Profile',
    path: '/profile/:userId',
    element: <UserProfile />
  },
  {
    name: 'Edit Profile',
    path: '/profile/:userId/edit',
    element: <EditProfile />
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />
  },
  {
    name: 'Auth Debug',
    path: '/auth-debug',
    element: <AuthDebug />
  },
  {
    name: 'Not Found',
    path: '/404',
    element: <NotFound />
  }
];

export default routes;
