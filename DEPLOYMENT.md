# Deployment Guide for NerdGamer

This guide will walk you through deploying your NerdGamer website to various platforms.

## Prerequisites

Before deploying, make sure you have:
1. Your code pushed to a GitHub repository
2. A PostgreSQL database (you can use cloud providers like Supabase, Railway, or Neon)
3. Environment variables ready

## Environment Variables Required

You'll need these environment variables for deployment:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-super-secret-jwt-key-here"
```

## Option 1: Vercel (Recommended)

Vercel is the easiest option for Next.js applications.

### Step 1: Prepare Your Repository
1. Make sure your code is pushed to GitHub
2. Ensure your `package.json` has the correct build scripts

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project
5. In the configuration:
   - Framework Preset: Next.js (should be auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

### Step 3: Set Environment Variables
1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Your JWT secret key
3. Make sure to add these to all environments (Production, Preview, Development)

### Step 4: Deploy
1. Click "Deploy"
2. Vercel will build and deploy your application
3. Your site will be available at `https://your-project-name.vercel.app`

### Step 5: Database Setup
1. After deployment, you need to run database migrations
2. Go to your Vercel project dashboard
3. Go to "Functions" → "View Function Logs"
4. You can run: `npx prisma db push` in the Vercel CLI or use a database management tool

## Option 2: Railway

Railway is great for full-stack applications with database hosting.

### Step 1: Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect it's a Node.js project

### Step 2: Add Database
1. In your Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will create a PostgreSQL database for you
3. The `DATABASE_URL` will be automatically set as an environment variable

### Step 3: Configure Environment Variables
1. Go to your service settings
2. Add `JWT_SECRET` environment variable
3. The `DATABASE_URL` should already be set by Railway

### Step 4: Deploy
1. Railway will automatically deploy when you push to your main branch
2. Your site will be available at the URL provided by Railway

## Option 3: Netlify

Netlify requires some additional configuration for Next.js API routes.

### Step 1: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18 (or higher)

### Step 2: Set Environment Variables
1. Go to "Site settings" → "Environment variables"
2. Add your environment variables

### Step 3: Configure Redirects
Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

## Database Setup

### For Production Database
You can use these cloud database providers:

1. **Supabase** (Recommended)
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your connection string from Settings → Database
   - Use the connection string as your `DATABASE_URL`

2. **Neon**
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Get your connection string from the dashboard

3. **Railway Database**
   - If using Railway, the database is automatically created

### Running Migrations
After setting up your database, you need to run migrations:

```bash
# If you have access to the deployment environment
npx prisma db push

# Or use a database management tool like Prisma Studio
npx prisma studio
```

## Post-Deployment Checklist

1. ✅ Environment variables are set
2. ✅ Database is connected and migrations are run
3. ✅ Application builds successfully
4. ✅ API routes are working
5. ✅ Authentication is working
6. ✅ Database operations are working

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Ensure Prisma client is generated during build

2. **Database Connection Issues**
   - Verify your `DATABASE_URL` is correct
   - Check if your database allows external connections
   - Ensure your database is running

3. **API Routes Not Working**
   - Check that your API routes are in the correct location (`src/app/api/`)
   - Verify environment variables are set correctly

4. **Authentication Issues**
   - Ensure `JWT_SECRET` is set and consistent
   - Check that cookies are being set correctly

### Getting Help

If you encounter issues:
1. Check the deployment platform's logs
2. Verify all environment variables are set
3. Test your application locally with production environment variables
4. Check the platform's documentation for Next.js deployment

## Custom Domain Setup

After deployment, you can set up a custom domain:

1. **Vercel**: Go to Settings → Domains
2. **Railway**: Go to Settings → Domains
3. **Netlify**: Go to Domain management

Follow the platform's instructions to configure your DNS settings. 