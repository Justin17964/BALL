# ChatConnect - Real-Time Messaging Platform

A modern, real-time messaging application where users can connect and chat with others by searching for their username or email address. Built with React, TypeScript, and Supabase.

## Features

- 💬 **Real-Time Messaging**: Send and receive messages instantly
- 🔍 **User Discovery**: Find users by username or email address
- 📱 **Conversation Management**: View all your conversations in one place
- 🔐 **Multi-Auth Support**: Username/password, Google SSO, and Discord OAuth
- 👤 **User Profiles**: Customizable profiles with avatar upload
- 📊 **Read Receipts**: See when messages have been read
- 🌐 **Community Features**: Optional discussion board with posts and groups
- 🎨 **Modern UI**: Clean design with dark mode support
- 📱 **Responsive**: Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Deployment**: Netlify-ready

## Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 10

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Deployment

### Deploy to Netlify

See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Build the project: `npm run build`
2. Deploy to Netlify (drag & drop `dist` folder or connect Git)
3. Configure environment variables in Netlify
4. Set up OAuth providers in Supabase

## Project Structure

```
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── layouts/      # Layout components
│   │   ├── ui/           # shadcn/ui components
│   │   └── ...           # Feature components
│   ├── contexts/         # React contexts (Auth)
│   ├── db/               # Database configuration and API
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── types/            # TypeScript type definitions
│   └── lib/              # Utility functions
├── public/               # Static assets
├── netlify.toml          # Netlify configuration
└── NETLIFY_DEPLOYMENT.md # Deployment guide
```

## Key Features

### Authentication
- Username/password with automatic profile creation
- Google SSO via Supabase Auth
- Discord OAuth integration
- First user automatically becomes admin

### Posts & Comments
- Create posts with title, content, and hashtags
- Upvote/downvote system
- Nested comment threads
- Real-time vote updates

### Groups
- Create interest-based communities
- Join/leave groups
- Group-specific feeds
- Member and post counts

### Admin Panel
- User role management
- Content moderation
- Platform statistics
- Search and filter users

## Environment Variables

Required variables (see `.env.example`):
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Database Schema

The application uses PostgreSQL via Supabase with the following main tables:
- `profiles`: User profiles with roles
- `posts`: User posts with vote counts
- `comments`: Nested comments with voting
- `votes`: User votes on posts/comments
- `groups`: Community groups
- `group_members`: Group membership
- `hashtags`: Unique hashtags
- `post_hashtags`: Post-hashtag relationships

All tables have Row Level Security (RLS) policies enabled.

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run linter

### Code Style

- TypeScript strict mode enabled
- ESLint + Biome for linting
- Prettier for formatting
- 2-space indentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- **OAuth Setup**: See [DISCORD_OAUTH_SETUP.md](./DISCORD_OAUTH_SETUP.md) for Discord configuration
- **Deployment**: Check [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for deployment help
- **Auth Debug**: Visit `/auth-debug` page to diagnose authentication issues
- **Supabase**: Review Supabase documentation for backend issues
- **Issues**: Create an issue in the repository

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Supabase](https://supabase.com/)
- Deployed on [Netlify](https://netlify.com/)
