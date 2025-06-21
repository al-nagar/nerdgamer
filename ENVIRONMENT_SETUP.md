# Environment Variables Setup

This guide will help you set up the required environment variables for your NerdGamer website.

## Required Environment Variables

### 1. Database Configuration
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nerdgamer"
```

### 2. Authentication
```env
JWT_SECRET="your-super-secret-jwt-key-here"
```

### 3. RAWG API (for game search)
```env
RAWG_API_KEY="your-rawg-api-key-here"
```

## How to Get a RAWG API Key

1. Go to [RAWG.io](https://rawg.io/)
2. Create an account or sign in
3. Go to your profile settings
4. Navigate to the "API" section
5. Generate a new API key
6. Copy the key and add it to your environment variables

## Setting Up Environment Variables

### For Local Development

1. Create a `.env.local` file in your project root:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nerdgamer"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"

# RAWG API
RAWG_API_KEY="your-rawg-api-key-here"
```

### For Production Deployment

Add these environment variables in your deployment platform:

#### Vercel
1. Go to your project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the appropriate values

#### Railway
1. Go to your project dashboard
2. Navigate to Variables
3. Add each variable with the appropriate values

#### Netlify
1. Go to your site dashboard
2. Navigate to Site settings → Environment variables
3. Add each variable with the appropriate values

## Testing Your Setup

After setting up the environment variables:

1. Restart your development server
2. Try searching for games in the admin panel
3. Check the console for any error messages

## Troubleshooting

### RAWG API Issues
- Make sure your API key is correct
- Check if you've exceeded the API rate limits
- Verify the API key is properly set in your environment

### Database Issues
- Ensure your PostgreSQL database is running
- Check that the connection string is correct
- Verify the database exists and is accessible

### JWT Issues
- Make sure JWT_SECRET is set and is a strong, random string
- Restart your server after changing JWT_SECRET 