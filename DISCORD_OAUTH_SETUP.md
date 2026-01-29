# Discord OAuth Setup Guide

## Issue
Discord OAuth authentication is not working. This guide will help you configure Discord OAuth properly.

## Prerequisites
1. A Discord account
2. Access to Discord Developer Portal
3. Supabase project access

## Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Enter application name (e.g., "Creative Communities")
4. Accept Discord's Terms of Service
5. Click "Create"

## Step 2: Configure OAuth2 Settings

1. In your Discord application, go to **OAuth2** → **General**
2. Copy your **Client ID** (you'll need this later)
3. Copy your **Client Secret** (you'll need this later)
4. Add Redirect URLs:
   - For local development: `https://iurisvdzqmcpidstpwpe.supabase.co/auth/v1/callback`
   - For production (Netlify): `https://iurisvdzqmcpidstpwpe.supabase.co/auth/v1/callback`
5. Click "Save Changes"

## Step 3: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `iurisvdzqmcpidstpwpe`
3. Navigate to **Authentication** → **Providers**
4. Find **Discord** in the list
5. Toggle it to **Enabled**
6. Enter the following:
   - **Client ID**: (paste from Discord Developer Portal)
   - **Client Secret**: (paste from Discord Developer Portal)
7. Click "Save"

## Step 4: Configure Site URL and Redirect URLs

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL**:
   - Local: `http://localhost:5173`
   - Production: `https://your-site-name.netlify.app`
3. Add **Redirect URLs**:
   - Local: `http://localhost:5173/**`
   - Production: `https://your-site-name.netlify.app/**`
4. Click "Save"

## Step 5: Test Discord OAuth

1. Start your application locally or visit your deployed site
2. Go to the login page
3. Click "Sign in with Discord"
4. You should be redirected to Discord's authorization page
5. Authorize the application
6. You should be redirected back to your application and logged in

## Troubleshooting

### Error: "Invalid OAuth redirect URI"
- **Cause**: Redirect URL mismatch between Discord and Supabase
- **Solution**: Ensure the redirect URL in Discord matches exactly: `https://iurisvdzqmcpidstpwpe.supabase.co/auth/v1/callback`

### Error: "Invalid client credentials"
- **Cause**: Incorrect Client ID or Client Secret
- **Solution**: Double-check the credentials in Supabase match those in Discord Developer Portal

### Error: "Discord provider is not enabled"
- **Cause**: Discord provider not enabled in Supabase
- **Solution**: Go to Supabase Dashboard → Authentication → Providers and enable Discord

### User is redirected but not logged in
- **Cause**: Site URL or Redirect URLs not configured correctly
- **Solution**: Verify Site URL and Redirect URLs in Supabase match your application URLs

### "Failed to sign in with Discord" error
- **Cause**: Multiple possible causes
- **Solution**: 
  1. Check browser console for detailed error messages
  2. Verify Discord application is not in "Verification Required" state
  3. Ensure your Discord account email is verified
  4. Try clearing browser cache and cookies

## Important Notes

1. **Discord Application Verification**: If your application gets more than 100 users, Discord will require verification. This is a Discord requirement, not a Supabase limitation.

2. **Redirect URL Format**: The redirect URL MUST be exactly:
   ```
   https://iurisvdzqmcpidstpwpe.supabase.co/auth/v1/callback
   ```
   Do NOT add your application URL here. Supabase handles the final redirect.

3. **Multiple Environments**: If you have multiple environments (local, staging, production), you only need ONE redirect URL in Discord (the Supabase callback URL). Configure different Site URLs in Supabase for each environment.

4. **Testing**: Always test OAuth flows in an incognito/private browser window to avoid cached authentication states.

## Current Configuration

Your application is configured with:
- **Supabase Project**: `iurisvdzqmcpidstpwpe`
- **Supabase URL**: `https://iurisvdzqmcpidstpwpe.supabase.co`
- **Required Discord Redirect**: `https://iurisvdzqmcpidstpwpe.supabase.co/auth/v1/callback`

## Code Implementation

The Discord OAuth is implemented in:
- **Auth Context**: `src/contexts/AuthContext.tsx` - `signInWithDiscord()` function
- **Login Page**: `src/pages/Login.tsx` - Discord sign-in button

The implementation uses Supabase's `signInWithOAuth()` method with the Discord provider.

## Support

If you continue to experience issues:
1. Check the browser console for error messages
2. Verify all configuration steps above
3. Ensure your Discord application is active and not suspended
4. Try creating a new Discord application if the issue persists
