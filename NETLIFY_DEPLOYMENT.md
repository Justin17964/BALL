# Creative Communities - Netlify Deployment Guide

## Prerequisites
1. A Netlify account (sign up at https://netlify.com)
2. A Supabase project (already configured)
3. GitHub repository (optional, for continuous deployment)

## Deployment Steps

### Option 1: Deploy via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize and deploy:
```bash
netlify init
netlify deploy --prod
```

### Option 2: Deploy via Netlify Dashboard

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository (GitHub/GitLab/Bitbucket)
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18

### Option 3: Manual Deploy (Drag & Drop)

1. Build the project locally:
```bash
npm run build
```

2. Go to https://app.netlify.com/drop
3. Drag and drop the `dist` folder

## Environment Variables

After deployment, configure these environment variables in Netlify:

### Required Variables

Go to: **Site settings** → **Environment variables** → **Add a variable**

1. **VITE_SUPABASE_URL**
   - Value: `https://iurisvdzqmcpidstpwpe.supabase.co`
   - Description: Your Supabase project URL

2. **VITE_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1cmlzdmR6cW1jcGlkc3Rwd3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTg4OTYsImV4cCI6MjA4NTE3NDg5Nn0.-tcyhqHwjfQrtSOxVZTCl6PEN1RbXlOYtZkKCsQ6KdY`
   - Description: Your Supabase anonymous key

## Configure OAuth Providers in Supabase

### Google SSO Setup

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Configure redirect URLs:
   - Add your Netlify URL: `https://your-site-name.netlify.app`
   - Callback URL: `https://your-site-name.netlify.app/auth/callback`

### Discord OAuth Setup

1. Go to Discord Developer Portal: https://discord.com/developers/applications
2. Create a new application or select existing one
3. Go to OAuth2 → General settings
4. Copy Client ID and Client Secret
5. Add redirect URL:
   - `https://iurisvdzqmcpidstpwpe.supabase.co/auth/v1/callback`
6. Save changes
7. Go to Supabase Dashboard → Authentication → Providers
8. Enable Discord provider
9. Paste Client ID and Client Secret
10. Save configuration
11. Update Site URL in Supabase:
    - Site URL: `https://your-site-name.netlify.app`
    - Redirect URLs: `https://your-site-name.netlify.app/**`

**Important**: The Discord redirect URL must be the Supabase callback URL, NOT your application URL. Supabase handles the final redirect to your application.

For detailed Discord OAuth setup instructions, see [DISCORD_OAUTH_SETUP.md](./DISCORD_OAUTH_SETUP.md)

## Post-Deployment Configuration

### 1. Update Supabase Site URL

In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://your-site-name.netlify.app`
- **Redirect URLs**: Add `https://your-site-name.netlify.app/**`

### 2. Test Authentication

1. Visit your deployed site
2. Try signing up with username/password
3. Test Google SSO (if configured)
4. Test Discord OAuth (if configured)

### 3. Verify First Admin User

The first user to register will automatically become an admin. After registration:
1. Login to the site
2. Check if "Admin Panel" appears in the user menu
3. Access admin panel to manage users and content

## Custom Domain (Optional)

1. Go to Netlify Dashboard → Domain settings
2. Click "Add custom domain"
3. Follow instructions to configure DNS
4. Update Supabase redirect URLs with your custom domain

## Troubleshooting

### Build Fails
- Check Node version is 18 or higher
- Verify all dependencies are in package.json
- Check build logs in Netlify dashboard

### OAuth Not Working
- Verify redirect URLs match exactly (including trailing slashes)
- Check that OAuth providers are enabled in Supabase
- Ensure Site URL is set correctly in Supabase
- Visit `/auth-debug` page to diagnose OAuth configuration issues
- See [DISCORD_OAUTH_SETUP.md](./DISCORD_OAUTH_SETUP.md) for detailed Discord setup

### Environment Variables Not Loading
- Redeploy after adding environment variables
- Check variable names start with `VITE_`
- Verify no typos in variable names

## Continuous Deployment

If connected to Git:
- Every push to main branch triggers automatic deployment
- Pull requests create deploy previews
- Configure branch deploys in Netlify settings

## Monitoring

- View deployment logs: Netlify Dashboard → Deploys
- Check analytics: Netlify Dashboard → Analytics
- Monitor errors: Netlify Dashboard → Functions (if using)

## Support

- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: Create an issue in your repository
