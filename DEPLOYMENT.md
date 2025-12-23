# Deployment Guide

## Quick Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Import `Erwin-Mota/slugspace` repository
4. Add these environment variables:
   - `NEXTAUTH_SECRET` - Generate a random 32+ character string
   - `NEXTAUTH_URL` - Set to `https://your-app.vercel.app` (after first deploy)
   - `DATABASE_URL` - Your production PostgreSQL connection string
   - `GITHUB_ID` - Your GitHub OAuth Client ID
   - `GITHUB_SECRET` - Your GitHub OAuth Client Secret
   - `GOOGLE_ID` - Your Google OAuth Client ID (if using)
   - `GOOGLE_SECRET` - Your Google OAuth Client Secret (if using)
5. Click "Deploy"

## Database Setup

You'll need a PostgreSQL database. Options:
- **Railway** (easiest): https://railway.app - Free tier available
- **Supabase**: https://supabase.com - Free tier available
- **Neon**: https://neon.tech - Free tier available

After creating the database, copy the connection string to `DATABASE_URL` in Vercel.

## After First Deploy

1. Update `NEXTAUTH_URL` in Vercel to your actual domain
2. Update OAuth callback URLs:
   - GitHub: `https://your-app.vercel.app/api/auth/callback/github`
   - Google: `https://your-app.vercel.app/api/auth/callback/google`

## Prisma Setup

Vercel will automatically run `prisma generate` during build. Make sure your `DATABASE_URL` is set correctly.

